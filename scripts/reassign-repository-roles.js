const { listAllRepositoriesInOrganization, listAllCollaboratorsInRepository } = require("../util/github");

module.exports = {
    description: "globally reassign permissions in all repositories within an organization",
    options: {
        organization: {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization containing the repositories to reassign roles",
            type: "string"
        },
        "old-role": {
            demandOption: true,
            describe: "old role",
            type: "string"
        },
        "new-role": {
            demandOption: true,
            describe: "new role",
            type: "string"
        }
    },
    action: async (octokit, argv) => {
        const oldRole = argv["old-role"];
        const newRole = argv["new-role"];

        const repositories = await listAllRepositoriesInOrganization(octokit, argv.organization);

        for (const repository of repositories) {
            const collaborators = await listAllCollaboratorsInRepository(octokit, argv.organization, repository.name);

            for (const collaborator of collaborators) {
                if (collaborator.role_name === oldRole) {
                    await octokit.rest.repos.addCollaborator({
                        owner: argv.organization,
                        repo: repository.name,
                        username: collaborator.login,
                        permission: newRole
                    });
                }
            }
        }
    }
};
