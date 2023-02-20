const { getTeamBySlug, listAllTeamsInOrganization, listAllReposForTeam } = require("../util/github");

module.exports = {
    description: "globally reassign permissions for all teams within an organization",
    options: {
        "organization": {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization containing the team(s) to reassign roles",
            type: "string",
        },
        "team-slug": {
            demandOption: false,
            describe: "a specific GitHub team slug to reassign the role to",
            type: "string",
        },
        "old-role": {
            demandOption: true,
            describe: "old role",
            type: "string",
        },
        "new-role": {
            demandOption: true,
            describe: "new role",
            type: "string",
        },
    },
    action: async (octokit, _graphql, argv) => {
        const oldRole = argv["old-role"];
        const newRole = argv["new-role"];
        const teamSlug = argv["team-slug"];
        let teams = [];
        let repositories = [];

        // If no team is specified, we will loop through all teams in the organization
        if (!teamSlug) {
            teams = await listAllTeamsInOrganization(octokit, argv.organization);
            console.log(`Found ${teams.length} teams in organization '${argv.organization}'.`);
        } else {
            try {
                teams.push(await getTeamBySlug(octokit, argv.organization, teamSlug));
                console.log(`Found team '${teamSlug}' in organization '${argv.organization}'.`)
            } // catch http error
            catch (error) {
                console.log(`Error: ${error}\nPlease make sure the team slug provided exists within the provided organization and try again.`);
            }
        }

        for (const team of teams) {
            try {
                repositories = await listAllReposForTeam(octokit, argv.organization, team.slug);
            } catch (error) {
                console.log(`Error: ${error}\nTeam ${team.slug} does not have any repositories.`);
            }
            let reposUpdated = 0;

            console.log(`Checking team '${team.slug}' for repositories with role '${oldRole}'...`);

            for (const repo of repositories) {
                if (repo.role_name === oldRole) {
                    console.log(`Updating team '${team.slug}' for repository '${argv.organization}/${repo.name}' from role '${oldRole}' to '${newRole}'`);

                    await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
                        org: argv.organization,
                        team_slug: team.slug,
                        owner: argv.organization,
                        repo: repo.name,
                        permission: newRole,
                    });
                    reposUpdated++;
                }
            }

            if (reposUpdated > 0) {
                console.log(`Finished checking team '${team.slug}'. Updated ${reposUpdated} repositories with role '${oldRole}' to '${newRole}'.`);
            } else {
                console.log(`Finished checking team '${team.slug}'. No repositories with role '${oldRole}' found.`);
            }
        }
    },
};
