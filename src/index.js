// imports
const bcrypt = require('bcrypt');
const express = require('express');
const { Client } = require('pg');
require('dotenv').config();
const ticketsRouter = require ('./routes/ticketsRouter');
const usersRouter = require ('./routes/usersRouter');

/************************************************
* Data's routes
*/
// declarations
const app = express();
const port = 8000;
const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

app.use('/api/tickets', ticketsRouter);
app.use('/api/users', usersRouter);
client.connect();

app.use(express.json());
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// LES ROUTES:

// users login
app.post('/register', async (req, res) => {
    console.log(req.body.password);
    const password = req.body.password;
    const name = req.body.name;
    bcrypt.hash(password, 10, async (err, hash) => {
        // Store hash in your password DB.
        try {

            const data = await client.query('INSERT INTO users (name, password) VALUES ($1, $2) RETURNING id,name', [name, hash]);
            if (data.rowCount > 0) {
                res.status(200).json({
                    status: "SUCCESS",
                    message: `Le mot de passe de ${id} a bien été modifié`,
                    data: data.rows
                });
                console.log(`POST | /api/users/register | 200 | SUCCESS \nLe mot de passe de ${id} a bien été modifié `);

            }
        }

        catch (err) {
            console.log(err.stack);
        };
    });
});


app.get('/login', async (req, res) => {
    console.log(req.body.password);
    const password = req.body.password;
    const name = req.body.name;
    bcrypt.hash(password, 10, async (err, hash) => {
        
        try {

            const data = await client.query('SELECT password FROM users WHERE name = $1', [name]);
            
            if (data.rowCount > 0) {
                res.status(200).json({
                    status: "SECCESS",
                    message: `L'utilisateur existe. Récupération de ${data.rowCount} tickets`,
                    data: data.rows
                });
                console.log(`GET | api/users/login | 200 | SUCCESS \nL'utilisateur existe. Récupération de ${data.rowCount} tickets`);
            }
            else {
                res.status(400).json({
                    status: "FAIL",
                    message: `L'utilisateur n'existe pas ou le password est invalide`,
                    data: undefined
                });
                console.log(`GET | api/users/login | 400 | FAIL \nL'utilisateur n'existe pas ou le password est invalide`);
            }

        }

        catch (err) {
            console.log(err.stack);
        };
    });
});

    // vérification du bon démarage de la page
    app.get('/hello', (req, res) => {
        res.send('Hello World!')
    });






    // ecoute le port 8000
    app.listen(port, () => {
        console.log(`Example app listening on port http://localhost:${port}`);
    });