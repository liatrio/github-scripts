const { listAllRepositoriesInOrganization } = require("../util/github");

let totalCommits = 0;

module.exports = {
    description: "list commits for repositories in an organization",
    options: {
        organization: {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization to search for language usage",
            type: "string",
        },
        history_in_days: {
            alias: "d",
            demandOption: false,
            describe: "the number of days to search for commits",
            type: "number",
            default: 30,
        },
    },
    action: async (octokit, _graphql, argv) => {
        const repositories = await listAllRepositoriesInOrganization(octokit, argv.organization);

        for (const repository of repositories) {
            const branchInfo = await octokit.rest.repos.listBranches({
                owner: argv.organization,
                repo: repository.name,
                per_page: 100,
            });

            // ISO 8601 timestamp for now
            const now = new Date();
            const nowIso = now.toISOString();

            // ISO 8601 timestamp for x number of days ago
            const daysAgo = new Date(now.setDate(now.getDate() - argv.history_in_days));
            const daysAgoIso = daysAgo.toISOString();

            // console.log(JSON.stringify(branchInfo, undefined, 2));

            for (const branch of branchInfo.data) {
                const commitStats = await _graphql(`
              {
                repository(owner: "${argv.organization}", name: "${repository.name}") {
                  object(expression: "${branch.name}") {
                    ... on Commit {
                      history(since: "${daysAgoIso}", until: "${nowIso}") {
                        totalCount
                      }
                    }
                  }
                }
              }
            `);

                // if total commits is not null, add it to the total
                try {
                    totalCommits += commitStats.repository.object.history.totalCount;
                    console.log(`Total commits for repo:${repository.name}/branch:${branch.name} in last ${argv.history_in_days} days: ${commitStats.repository.object.history.totalCount}`);
                } catch {
                    console.log(`No commits for repo:${repository.name}/branch:${branch.name}`);
                }
            }
        }

        console.log(`Total commits in last ${argv.history_in_days} days for ${argv.organization} organization: ${totalCommits}`);
    },
};
