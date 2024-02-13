const dotenv = require("dotenv");
const mysql2 = require("mysql2/promise");

dotenv.config();

const baseConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
};

const dbConfig = {...baseConfig, database: 'db'};

const createDb = async () => {
    const pool = mysql2.createPool(baseConfig);

    try {
        await pool.execute('CREATE DATABASE IF NOT EXISTS db');
        console.log('Database created successfully');
    } catch (err) {
        console.error('Error', err)
    }

    await pool.end();
}

const createTables = async () => {
    const pool = mysql2.createPool(dbConfig);

    try {
        await pool.execute('CREATE TABLE IF NOT EXISTS users (username varchar(255), uuid varchar(255))');
        console.log('User table created successfully');
        await pool.execute('CREATE TABLE IF NOT EXISTS messages (sender_uuid varchar(255), recipient_uuid varchar(255), message TEXT, datetime DATETIME)');
        console.log('Messages table created successfully')
    } catch (err) {
        console.error('Error', err)
    }

    await pool.end();
}

const insertUser = async (username, userUuid) => {
    const pool = mysql2.createPool(dbConfig);

    try {
        await pool.execute(`INSERT INTO users (username, uuid) VALUES ('${username}', '${userUuid}')`);
        console.log('New user added');
    } catch (err) {
        console.error('Error', err)
    }

    await pool.end();
}

const selectUser = async (userUuid) => {
    const pool = mysql2.createPool(dbConfig);

    try {
        const [results, _] = await pool.execute(`SELECT username FROM users WHERE uuid = '${userUuid}'`);
        const [{username}] = results;
        await pool.end()
        return username
    } catch (err) {
        await pool.end()
        console.error('Error', err)
    }
}

const insertMessage = async (senderUuid, recipientUuid, message) => {
    const pool = mysql2.createPool(dbConfig);

    try {
        const date = new Date();
        const datetime = date.toISOString().slice(0, 19).replace('T', ' ');
        await pool.execute(`INSERT INTO messages (sender_uuid, recipient_uuid, message, datetime) VALUES ('${senderUuid}', '${recipientUuid}', '${message}', '${datetime}')`);
        console.log('New message added');
    } catch (err) {
        console.error('Error', err)
    }

    await pool.end();
}

createDb().then(createTables);


exports.insertUser = insertUser;
exports.selectUser = selectUser;
exports.insertMessage = insertMessage;
