const emoji = require("node-emoji");

const warn = (message) => console.log(emoji.get("warning") + "  " + message);

const success = (message) => console.log(emoji.get("white_check_mark") + "  " + message);

module.exports = {
    success,
    warn,
};
