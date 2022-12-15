const { listFileCountInRepository, searchByCriteria } = require("../util/github");

module.exports = {
    description: "list repos matching organization and extensions",
    options: {
        organization: {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization to search",
            type: "string",
        },
        extensions: {
            alias: "e",
            demandOption: true,
            describe: "an array of extensions being searched for",
            type: "array",
        },
    },
    action: async (octokit, _graphql, argv) => {
        const reposMatchingExtensions = {};

        const formattedExtensionsString = `+extension:${argv.extensions.join("+extension:")}`;

        const queryResults = await searchByCriteria(octokit, `*+org:${argv.organization}${formattedExtensionsString}`);

        for (const result of queryResults) {
            const repoName = result.repository.name;

            if (reposMatchingExtensions[repoName]) {
                reposMatchingExtensions[repoName].occurrences++;
            } else {
                const repoFileCount = await listFileCountInRepository(octokit, argv.organization, repoName);

                reposMatchingExtensions[repoName] = {
                    occurrences: 1,
                    total_file_count: repoFileCount,
                };
            }
        }

        console.table(reposMatchingExtensions);
    },
};
