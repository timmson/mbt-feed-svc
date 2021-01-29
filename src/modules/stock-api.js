const MoexAPI = require("moex-api");
const Moex = require("../lib/moex");
const moex = new Moex(new MoexAPI());

function stockAPI() {
    return moex.getMessage();
}

module.exports = stockAPI;