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
        percent: {
            alias: "p",
            default: 25,
            describe: "what percentage of code is needed to qualify as a \"used\" language",
            type: "number",
        },
    },
    action: async (octokit, argv) => {
        const languagesInOrg = {};

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
                } else {
                    languagesInOrg[language] = {
                        count: 1,
                        repos: [repository.name],
                    };
                }
            }
        }

        console.table(languagesInOrg);
    },
};
