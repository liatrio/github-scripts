const listAllRepositoriesInOrganization = async (octokit, organization) => {
    const repositories = await octokit
        .paginate(octokit.rest.repos.listForOrg, {
            org: organization,
            type: 'any',
            per_page: 100
        });

    return repositories.filter((repository) => !repository.archived);
};

const listAllCollaboratorsInRepository = (octokit, organization, repository) =>
    octokit.paginate(octokit.rest.repos.listCollaborators, {
        owner: organization,
        repo: repository,
        affiliation: "direct",
    });

module.exports = {
    listAllRepositoriesInOrganization,
    listAllCollaboratorsInRepository
};
