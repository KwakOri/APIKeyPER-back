require("dotenv").config();

const pg = require("pg");
const { Client } = pg;

const client = new Client({
  host: process.env.PG_DB_HOST,
  port: process.env.PG_DB_PORT,
  user: process.env.PG_DB_USER,
  password: process.env.PG_DB_PASSWORD,
  database: process.env.PG_DB_DATABASE,
});

module.exports = client;
