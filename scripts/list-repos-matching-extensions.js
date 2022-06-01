const { searchByCriteria } = require("../util/github");

module.exports = {
    description: "list language usage within an organization",
    options: {
        organization: {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization to search for language usage",
            type: "string"
        },
        extensions: {
            alias: "e",
            demandOption: true,
            describe: "a comma seperated list of extensions being searched for",
            type: "string"
        },
    },
    action: async (octokit, argv) => {
        const reposMatchingExtensions = {};

        const extensionsArray = argv.extensions.split(",")
        const formattedExtensionsString = "+extension:" + extensionsArray.join("+extension:")

        const queryResults = await searchByCriteria(octokit, `*+org:${argv.organization}${formattedExtensionsString}`)

        for (const result of queryResults) {
            const repo_full_name = result.repository.full_name

            if (reposMatchingExtensions[repo_full_name]) {
                reposMatchingExtensions[repo_full_name].occurrences++
            } else {
                const fileSearch = await octokit.rest.search.code({
                    q: `*+repo:${repo_full_name}`
                })

                reposMatchingExtensions[repo_full_name] = {
                    occurrences: 1,
                    total_file_count: fileSearch.data.total_count
                }
            }
        }

        console.table(reposMatchingExtensions)
    }
};