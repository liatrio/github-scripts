const { searchByCriteria } = require("../util/github");

module.exports = {
    description: "list repos matching organization and extensions",
    options: {
        organization: {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization to search",
            type: "string"
        },
        extensions: {
            alias: "e",
            demandOption: true,
            describe: "an array of extensions being searched for",
            type: "array"
        },
        count: {
            alias: "c",
            default: false,
            describe: "boolean flag to enable total count of files, will drastically reduce execution time",
            type: "bool"
        }
    },
    action: async (octokit, argv) => {
        const reposMatchingExtensions = {};
        let count = 1;

        const formattedExtensionsString = "+extension:" + argv.extensions.join("+extension:")

        const queryResults = await searchByCriteria(octokit, `*+org:${argv.organization}${formattedExtensionsString}`)

        for (const result of queryResults) {
            const repoFullName = result.repository.full_name

            if (reposMatchingExtensions[repoFullName]) {
                reposMatchingExtensions[repoFullName].occurrences++
            } else {
                if (argv.count) {
                    const fileSearch = await octokit.rest.search.code({
                        q: `*+repo:${repoFullName}`
                    })
                    count++
    
                    reposMatchingExtensions[repoFullName] = {
                        occurrences: 1,
                        total_file_count: fileSearch.data.total_count
                    }
                } else {
                    reposMatchingExtensions[repoFullName] = {
                        occurrences: 1
                    }
                }
            }
        }

        console.table(reposMatchingExtensions)
    }
};
