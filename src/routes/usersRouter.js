// IMPORTS
const express = require('express');
const client = require('../client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//const accessTokenSecret = 'youraccesstokensecret';

const usersRouter = express.Router();


// POST DU LOGIN UTILISATEUR
usersRouter.post('/login', async (req, res) => {
    const { name, password } = req.body;

    // vérifier le nom de l'utilisateur existe
    if (name === undefined || typeof name !== typeof String()) {
        res.status(400).json({
            status: "FAIL",
            message: "Le nom est inexistant ou invalide",
            data: undefined
        });
        console.log(`${req.method} | ${req.originalUrl} |  \nLe nom est inexistant ou invalide`);
        //console.log('POST | users/login | 400 | FAIL \nLe nom est inexistant ou invalide');
        return ;
    }


    // vérifier le mot de passe existe
    if (password === undefined || typeof password !== typeof String()) {
        res.status(400).json({
            status: "FAIL",
            message: "Le mot de passe n'existe pas",
            data: undefined
        });
        console.log(`${req.method} | ${req.originalUrl} |  \nLe mot de passe n\'existe pas`);
        //console.log('POST | users/login | 400 | FAIL \nLe mot de passe n\'existe pas');
        return;
    }
    try {

        const data = await client.query('SELECT password, id FROM users WHERE name = $1', [name]);
        bcrypt.compare(password, data.rows[0].password, function (err, result) {

            const accessToken = jwt.sign({ userId: data.rows[0].id }, process.env.TOKEN_SECRET);

            if (result === true) {
                res.status(200).json({
                    status: "SUCCESS",
                    message: `Nom et Password valides.`,
                    data: {...data.rows[0],token : accessToken}
                });
                console.log(`${req.method} | ${req.originalUrl} |  \nNom et Password valides`);
               // console.log(`GET | api/users/login | 200 | SUCCESS \nNom et Password valides`);
            }
            else {
                res.status(400).json({
                    status: "FAIL",
                    message: `Le password est invalide`,
                    data: undefined
                });
                console.log(`${req.method} | ${req.originalUrl} | \nLe password est invalide`);
                //console.log(`GET | api/users/login | 400 | FAIL \nLe password est invalide`);
            }
        })
    }
    catch (err) {
        console.log(err.stack);
    };
});



// POST DU REGISTER
usersRouter.post('/register', async (req, res) => {
    console.log(req.body.password);
    const password = req.body.password;
    const name = req.body.name;

    // vérifier le nom de l'utilisateur existe
    if (name === undefined || typeof name !== typeof String()) {
        res.status(400).json({
            status: "FAIL",
            message: "Le nom est inexistant ou invalide",
            data: undefined
        });
        console.log(`${req.method} | ${req.originalUrl} | \nLe nom est inexistant ou invalide`);
        //console.log('POST | users/login | 400 | FAIL \nLe nom est inexistant ou invalide');
    }

    // vérifier le mot de passe existe
    if (password === undefined || typeof password !== typeof String()) {
        res.status(400).json({
            status: "FAIL",
            message: "Le mot de passe est inexistant ou invalide",
            data: undefined
        });
        console.log(`${req.method} | ${req.originalUrl} | n\Le mot de passe est inexistant ou invalide`);
        //console.log('POST | users/login | 400 | FAIL \nLe mot de passe est inexistant ou invalide');

    }
    bcrypt.hash(password, 10, async (err, hash) => {
        // Store hash in your password DB.
        try {
            const userList = await client.query('SELECT * FROM users WHERE name = $1', [name])

            if (userList.rowCount === 0 ){
                const data = await client.query('INSERT INTO users (name, password) VALUES ($1, $2) RETURNING id,name', [name, hash]);
                if (data.rowCount > 0) {
                    res.status(200).json({
                        status: "SUCCESS",
                        message: `Le mot de passe de ${name} est valide`,
                        data: data.rows
                    });
                    console.log(`${req.method} | ${req.originalUrl} | \nLe mot de passe de ${name} est valide`);
                    //console.log(`POST | /api/users/register | 200 | SUCCESS \nLe mot de passe de ${name} est valide`);
    
                }
            }
            else
            {
                res.status(400).json({
                    status: "FAIL",
                    message: `Cet utilisateur existe déjà`,
                    data: undefined
                });
                console.log(`${req.method} | ${req.originalUrl} | Cet utilisateur existe déjà`);
            }

        }

        catch (err) {
            console.log(err.stack);
        };
    });
});


module.exports = usersRouter;