const { searchByCriteria } = require("../util/github");
const { warn, success, info, list, confirm } = require("../util/log");
const { convertTupleToCSVColumns } = require("../util/strings");

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

        let count = 0;

        const jankinsResults = new Set();
        const jankinsQueryString = `fork:true filename:Jenkinsfile`;

        //const jankinsQueryResults = await searchByCriteria(octokit, `${jankinsQueryString} ${orgs.join(" ")}`);
        const jankinsQueryResults = await searchByCriteria(octokit, `${jankinsQueryString}`);

        for (const result of jankinsQueryResults) {
            jankinsResults.add(result.repository.full_name);
            count++;
        }

        const azurePipelinesResults = new Set();
        const azurePipelinesQueryString = `fork:false extension:yml extension:yaml vmImage`;

        //const azurePipelinesQueryResults = await searchByCriteria(octokit, `${azurePipelinesQueryString} ${orgs.join(" ")}`);
        const azurePipelinesQueryResults = await searchByCriteria(octokit, `${azurePipelinesQueryString}`);

        for (const result of azurePipelinesQueryResults) {
            azurePipelinesResults.add(result.repository.full_name);
            count++;
        }

        const githubActionsResults = new Set();
        const githubActionsQueryString = `fork:true path:/.github/workflows extension:yml extension:yaml runs-on:`;

        //const githubActionsQueryResults = await searchByCriteria(octokit, `${githubActionsQueryString} ${orgs.join(" ")}`);
        const githubActionsQueryResults = await searchByCriteria(octokit, `${githubActionsQueryString}`);

        for (const result of githubActionsQueryResults) {
            githubActionsResults.add(result.repository.full_name);
            count++;
        }

        // print count of repos using each tool
        console.log(`Total Repos Searched: ${count}`);

        console.log(`Jenkins: ${jankinsResults.size}`);
        console.log(`Azure Pipelines: ${azurePipelinesResults.size}`);
        console.log(`GitHub Actions: ${githubActionsResults.size}`);

        // Output to csv
        const data = [["jenkins",jankinsResults],["azure", azurePipelinesResults],["github",githubActionsResults]]
        
        convertTupleToCSVColumns(data, "cicd-tools.csv")


        const javaResults = new Set();
        const javaQueryString = `language:java`;

        //const javaQueryResults = await searchByCriteria(octokit, `${javaQueryString} ${orgs.join(" ")}`);
        const javaQueryResults = await searchByCriteria(octokit, `language:java`);

        for (const result of javaQueryResults) {
            javaResults.add(result.repository.full_name);
        }

        console.log(`java: ${javaResults.size}`);


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
