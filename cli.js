const yargs = require("yargs/yargs");
const { Octokit } = require("@octokit/rest");
const { hideBin } = require("yargs/helpers");
const fs = require("node:fs/promises");
const path = require("node:path");

(async () => {
    const scriptsDir = path.join(__dirname, "scripts");
    const files = await fs.readdir(scriptsDir);

    let argv = yargs(hideBin(process.argv))
        .option("t", {
            alias: "token",
            describe: "GitHub personal access token to use when making API calls",
            demandOption: true,
        })
        .default("t", () => {
            return process.env.GITHUB_TOKEN;
        }, "GITHUB_TOKEN environment variable");

    const actions = {};

    for (const file of files) {
        const { description, options, action } = require(path.join(scriptsDir, file));
        const { name } = path.parse(file);

        actions[name] = action;

        argv = argv.command(name, description, options);
    }

    argv = argv
        .wrap(null)
        .help()
        .demandCommand()
        .strict()
        .argv

    const octokit = new Octokit({ auth: argv.token });

    await actions[argv._[0]](octokit, argv);
})();
