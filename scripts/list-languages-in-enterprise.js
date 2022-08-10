const { listAllRepositoriesInOrganization } = require("../util/github");

const getTotalCodeSizeInBytes = (obj) => Object.values(obj).reduce((accumulator, value) => accumulator + value, 0);

module.exports = {
    description: "list language usage within an enterprise",
    options: {
        enterprise: {
            alias: "e",
            demandOption: true,
            describe: "the GitHub enterprise to search for language usage",
            type: "string",
        },
        percent: {
            alias: "p",
            default: 25,
            describe: "what percentage of code is needed to qualify as a \"used\" language",
            type: "number",
        },
    },
    action: async (octokit, graphql, argv) => {
        const orgAndRepo = [];
        let hasNextPage = true;
        let hasNextPageRepos = true;
        let endCursor = null;
        let endCursorRepos = null;
        const languagesInEnterprise = {};
        const start = Date.now();

        while (hasNextPage) {
            const enterpriseInfo = await graphql(`
                query ListOrgs {
                  viewer {
                    login
                  }
                  enterprise(slug: "${argv.enterprise}") {
                    id
                    organizations(
                        first: 100
                        after: ${endCursor}
                      ) {
                      nodes {
                        login
                        url
                      }
                      pageInfo {
                        startCursor
                        hasPreviousPage
                        hasNextPage
                        endCursor
                      }
                    }
                    slug
                    name
                  }
                }
            `);

            console.log(JSON.stringify(enterpriseInfo, null, 2));
            // return;

            hasNextPage = enterpriseInfo.enterprise.organizations.pageInfo.hasNextPage;
            endCursor = `"${enterpriseInfo.enterprise.organizations.pageInfo.endCursor}"`;

            const allOrgsInEnterprise = enterpriseInfo.enterprise.organizations.nodes.map((org) => org.login);
            console.log(allOrgsInEnterprise);

            for (const org of allOrgsInEnterprise) {
                // const repositories = await listAllRepositoriesInOrganization(octokit, org);

                while (hasNextPageRepos) {
                    const orgInfo = await graphql(`
                        query ListOrgRepos {
                          organization(login: "${org}") {
                            login
                            url
                            repositories(first: 100 after: ${endCursorRepos}) {
                              pageInfo {
                                endCursor
                                hasNextPage
                                startCursor
                                hasPreviousPage
                              }
                              nodes {
                                name
                              }
                            }
                          }
                        }
                    `);

                    console.log(JSON.stringify(orgInfo, null, 2));

                    hasNextPageRepos = orgInfo.organization.repositories.pageInfo.hasNextPage;
                    endCursorRepos = `"${orgInfo.organization.repositories.pageInfo.endCursor}"`;

                    for (const repo of orgInfo.organization.repositories.nodes) {
                        orgAndRepo.push({
                            organization: org,
                            repository: repo.name,
                        });
                    }
                }

                hasNextPageRepos = true;
            }
        }

        let languages;
        const failedRepos = [];

        for (const repository of orgAndRepo) {
            try {
                languages = await octokit.rest.repos.listLanguages({
                    owner: repository.organization,
                    repo: repository.repository,
                });
            } catch (error) {
                console.log(`Exception listing languages for [${repository.organization}/${repository.repository}]: [${error}]`);
                failedRepos.push(`"${repository.organization}/${repository.repository}"`);
            }

            const sumBytes = getTotalCodeSizeInBytes(languages.data);

            for (const language in languages.data) {
                const percent = Math.round((languages.data[language] / sumBytes) * 100);

                if (languagesInEnterprise[language] && percent >= argv.percent) {
                    languagesInEnterprise[language].count++;
                    languagesInEnterprise[language].repos.push(`${repository.organization}/${repository.repository}`);
                } else {
                    languagesInEnterprise[language] = {
                        count: 1,
                        repos: [`${repository.organization}/${repository.repository}`],
                    };
                }
            }
        }

        console.table(languagesInEnterprise);
        console.log(`Number of repos with errors: [${failedRepos.length}]`);
        const end = Date.now();
        const duration = end - start;
        console.log(`Script took [${duration / 1000}] seconds`);
    },
};
