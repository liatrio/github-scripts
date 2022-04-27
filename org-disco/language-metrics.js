const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const ORGANIZATION_LIST = ['liatrio']
const PERCENTAGE_OF_CODE_THRESHOLD = 10;


(async () => {
    const {
        data: { login },
    } = await octokit.rest.users.getAuthenticated()

    let languagesInOrg = {}

    for (let org of ORGANIZATION_LIST) {
        const allReposInOrg = await octokit
            .paginate(octokit.rest.repos.listForOrg, {
                org: org,
                type: 'any',
                per_page: 100
            })

        const repoNames = allReposInOrg
            .filter((repo) => !repo.archived)
            .map((repo) => repo.name)

        const getTotalCodeSizeInBytes = obj => Object.values(obj).reduce((accumulator, value) => accumulator + value, 0);

        for (let repo of repoNames) {
            const repoLanguages = await octokit.rest.repos.listLanguages({
                owner: org,
                repo
            })

            sumBytes = getTotalCodeSizeInBytes(repoLanguages.data);

            for (let languageName in repoLanguages.data) {
                const percent = Math.round((repoLanguages.data[languageName] / sumBytes) * 100)

                if (languagesInOrg[languageName] && percent >= PERCENTAGE_OF_CODE_THRESHOLD) {
                    languagesInOrg[languageName].count++
                    languagesInOrg[languageName].repos.push(repo)
                } else {
                    languagesInOrg[languageName] = {
                        count: 1,
                        repos: [repo]
                    }
                }
            }
        }
    }
    console.table(languagesInOrg)
})()
