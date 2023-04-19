const fs = require("fs");
const path = require("path");
const { listAllRepositoriesInOrganization } = require("../util/github");

const getTotalCodeSizeInBytes = (obj) => Object.values(obj).reduce((accumulator, value) => accumulator + value, 0);

module.exports = {
    description: "list language usage within an organization",
    options: {
        organization: {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization to search for language usage",
            type: "string",
        },
        outputFilePath: {
            alias: "f",
            describe: "the path of the output file to write the results to",
            type: "string",
        },
        percent: {
            alias: "p",
            default: 25,
            describe: "what percentage of code is needed to qualify as a \"used\" language",
            type: "number",
        },
    },
    action: async (octokit, _graphql, argv) => {
        const languagesInOrg = {};
        const currentDirectory = process.cwd();
        const date = new Date().toISOString();
        const outputFilePath = argv.outputFilePath || path.join(currentDirectory, `languages-in-organization.${argv.organization}.${date}.json`);

        // check if argv.outputFilePath is set, if so check if the parent directory exists as we will not create it
        if (argv.outputFilePath) {
            const parentDirectory = path.join(argv.outputFilePath, "..");
            // if the parent directory does not exist, exit the script
            if (!fs.existsSync(parentDirectory)) {
                console.error(`The parent directory of the provided output file path does not exist: '${parentDirectory}'`);

                return;
            }
        }

        const repositories = await listAllRepositoriesInOrganization(octokit, argv.organization);

        for (const repository of repositories) {
            const languages = await octokit.rest.repos.listLanguages({
                owner: argv.organization,
                repo: repository.name,
            });

            const sumBytes = getTotalCodeSizeInBytes(languages.data);

            for (const language in languages.data) {
                const percent = Math.round((languages.data[language] / sumBytes) * 100);

                if (languagesInOrg[language] && percent >= argv.percent) {
                    languagesInOrg[language].count++;
                    languagesInOrg[language].repos.push(repository.name);
                } else if (percent >= argv.percent) {
                    languagesInOrg[language] = {
                        count: 1,
                        repos: [repository.name],
                    };
                }
            }
        }

        // Print results to console in table format
        // Repo arrays will be truncated if they contain more than 3 items
        // Due to that, we will also write the results to a file
        console.table(languagesInOrg);

        // Write results to file
        fs.writeFile(outputFilePath, JSON.stringify(languagesInOrg, undefined, 2), (err) => {
            if (err) {
                console.error(err);

                return;
            }

            console.log(`Output file has been created: '${outputFilePath}'`);
        });
    },
};
