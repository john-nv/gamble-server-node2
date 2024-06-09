const { Client } = require('pg')

const client = new Client({
    host: "167.86.83.212",
    user: "postgres",
    port: "5432",
    password: "720798d5-aa5a-476e-a3a3-5e3392324052",
    database: "OkVip.Gamble",
})

module.exports = client;


