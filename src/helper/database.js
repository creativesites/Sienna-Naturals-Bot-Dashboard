// lib/database.js
const { Client } = require('pg');

const pgClient = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

pgClient.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => {
        console.error('Connection error:', err.stack);
        process.exit(1);
    });

module.exports = { pgClient };