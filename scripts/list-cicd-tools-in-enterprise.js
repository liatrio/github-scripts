const { searchByCriteria } = require("../util/github");
const { warn, success, info, list, confirm } = require("../util/log");

module.exports = {
    description: "list cicd tool usage in an enterprise",
    options: {
        enterprise: {
            alias: "e",
            demandOption: true,
            describe: "the GitHub enterprise to search for cicd tool usage usage",
            type: "string",
        },
        organization: {
            alias: "o",
            demandOption: false,
            describe: "a comma separated list of GitHub organizations to search for cicd tool usage",
            type: "string",
        }
    },
    action: async (octokit, _graphql, argv) => {
        // if organization is not undefined
        if (argv.organization) {
            const orgs = argv.organization.split(",").map(org => `org:${org}`);
        }

        const jankinsResults = new Set();
        const jankinsQueryString = `filename:Jenkinsfile`;

        //const jankinsQueryResults = await searchByCriteria(octokit, `${jankinsQueryString} ${orgs.join(" ")}`);
        const jankinsQueryResults = await searchByCriteria(octokit, `${jankinsQueryString}`);

        for (const result of jankinsQueryResults) {
            jankinsResults.add(result.repository.full_name);
        }

        const azurePipelinesResults = new Set();
        const azurePipelinesQueryString = `extension:yml extension:yaml vmImage`;

        //const azurePipelinesQueryResults = await searchByCriteria(octokit, `${azurePipelinesQueryString} ${orgs.join(" ")}`);
        const azurePipelinesQueryResults = await searchByCriteria(octokit, `${azurePipelinesQueryString}`);

        for (const result of azurePipelinesQueryResults) {
            azurePipelinesResults.add(result.repository.full_name);
        }

        const githubActionsResults = new Set();
        const githubActionsQueryString = `path:/.github/workflows extension:yml extension:yaml runs-on:`;

        //const githubActionsQueryResults = await searchByCriteria(octokit, `${githubActionsQueryString} ${orgs.join(" ")}`);
        const githubActionsQueryResults = await searchByCriteria(octokit, `${githubActionsQueryString}`);

        for (const result of githubActionsQueryResults) {
            githubActionsResults.add(result.repository.full_name);
        }

        // print count of repos using each tool
        console.log(`Jenkins: ${jankinsResults.size}`);
        console.log(`Azure Pipelines: ${azurePipelinesResults.size}`);
        console.log(`GitHub Actions: ${githubActionsResults.size}`);

        /*const queryResults = await searchByCriteria(octokit, `${queryString}`);

        for (const result of queryResults) {
            const repoName = result.repository.name;

            if (reposByCICD[repoName]) {
                reposMatchingExtensions[repoName].occurrences++;
            } else {
                const repoFileCount = await listFileCountInRepository(octokit, argv.organization, repoName);

                reposMatchingExtensions[repoName] = {
                    occurrences: 1,
                    total_file_count: repoFileCount,
                };
            }
        }

        console.table(reposMatchingExtensions);*/
    },
};
