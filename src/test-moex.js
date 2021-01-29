const MoexAPI = require("moex-api");

const moexAPI = new MoexAPI();

moexAPI.securityMarketData("USD000UTSTOM")
    .then(function (security) {

        let curs = parseFloat(security.node.last);
        console.log(security.node.last);
        moexAPI.securityMarketData("VTBA")
            .then(function (security) {
                console.log(parseFloat(security.node.last) / curs); // e.g. 64.04
            });
    });


