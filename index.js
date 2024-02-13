const express = require("express");

const dotenv = require('dotenv');
const fs = require('fs');
const uuid = require('uuid');

const db = require('./db');

dotenv.config()
const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL || `https://localhost:${PORT}`;
const app = express();

const {auth, requiresAuth} = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: BASE_URL,
  clientID: process.env.AUTH_CLIENT_ID,
  issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {

    console.log('hey yo', req.oidc);
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

// app.get('/', (req, res) => {
//     fs.readFile('main.html', function(err, data) {
//         res.writeHead(200, {'Content-Type': 'text/html'});
//         res.write(data);
//         return res.end();
//     });
// })

app.get('/retrieve_user', (req, res) => {
    const url = new URL(req.url, BASE_URL);
    const params = new URLSearchParams(url.search);

    const userUuid = params.get('userUuid')
    db.selectUser(userUuid).then((username) => {
        res.status(200).send({username, userUuid, isNewUser: false});
    });
})

app.get('/generate_uuid', (req, res) => {
    const url = new URL(req.url, BASE_URL);
    const params = new URLSearchParams(url.search);

    const username = params.get('username');
    const userUuid = uuid.v4();

    db.insertUser(username, userUuid).then(() => {
        res.status(200).send({username, userUuid, isNewUser: true});
    });
})

app.get('/add_secret', (req, res) => {
    const url = new URL(req.url, BASE_URL);
    const params = new URLSearchParams(url.search);

    const senderUuid = params.get('senderUuid');
    const message = params.get('message')

    db.insertMessage(senderUuid, senderUuid, message).then(() => {
        res.status(200).send();
    });
})

app.listen(PORT, function (req, res) {
    console.log(`Server is running at port ${PORT}`);
});