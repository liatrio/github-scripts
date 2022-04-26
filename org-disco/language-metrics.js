const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const ORGANIZATION = 'liatrio'
const PERCENTAGE_OF_CODE_THRESHOLD = 25;


(async () => {
    const {
        data: { login },
    } = await octokit.rest.users.getAuthenticated()

    const allRepos = await octokit
        .paginate(octokit.rest.repos.listForOrg, {
            org: 'liatrio',
            type: 'any',
            per_page: 100
        })

    const repoNames = allRepos
        .filter((repo) => !repo.archived)
        .map((repo) => repo.name)

    let languagesInOrg = {}
    const getTotalCodeSizeInBytes = obj => Object.values(obj).reduce((accumulator, value) => accumulator + value, 0);

    for (let repo of repoNames) {
        const repoLanguages = await octokit.rest.repos.listLanguages({
            owner: ORGANIZATION,
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
    console.table(languagesInOrg)

})()
