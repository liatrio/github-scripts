const emoji = require("node-emoji");
const prompts = require("prompts");

const warn = (message) => console.log(emoji.get("warning") + "  " + message);

const success = (message) => console.log(emoji.get("white_check_mark") + "  " + message);

const info = (message) => console.log(emoji.get("information_source") + "  " + message)

const list = (items) => items.forEach((item) => {
    console.log(`  ${emoji.get("small_orange_diamond")} ${item}`);
});

const confirm = async (message = "Are you sure you wish to continue?") => {
    const { ok } = await prompts({
        type: "confirm",
        message: ` ${message}`,
        name: "ok",
    });

    if (ok) {
        console.log();
    }

    return ok;
}

module.exports = {
    success,
    warn,
    info,
    list,
    confirm
};
