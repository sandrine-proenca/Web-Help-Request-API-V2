const express = require('express');
const client = require('../client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const accessTokenSecret = 'youraccesstokensecret';

const usersRouter = express.Router();


// récupération du tableau de tous les utilisateurs
usersRouter.post('/login', async (req, res) => {
    console.log(req.body.password);
    const { name, password } = req.body;

    // vérifier le nom de l'utilisateur existe
    if (name === undefined || typeof name !== typeof String()) {
        res.status(400).json({
            status: "FAIL",
            message: "Le nom est inexistant ou invalide",
            data: undefined
        });
        console.log('POST | users/login | 400 | FAIL \nLe nom est inexistant ou invalide');
    }

    // vérifier le mot de passe existe
    if (password === undefined || typeof password !== typeof String()) {
        res.status(400).json({
            status: "FAIL",
            message: "Le mot de passe n'existe pas",
            data: undefined
        });
        console.log('POST | users/login | 400 | FAIL \nLe mot de passe n\'existe pas');

    }

    bcrypt.hash(password, 10, async (err, hash) => {

        try {

            const data = await client.query('INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *', [name]);

            if (data.rowCount > 0) {
                res.status(200).json({
                    status: "SECCESS",
                    message: `Nom et Password existent. Récupération de ${data.rowCount} tickets`,
                    data: data.rows
                });
                console.log(`GET | api/users/login | 200 | SUCCESS \nNom et Password existent. Récupération de ${data.rowCount} tickets`);
            }
            else {
                res.status(400).json({
                    status: "FAIL",
                    message: `L'utilisateur n'existe pas ou le password est invalide`,
                    data: undefined
                });
                console.log(`GET | api/users/login | 400 | FAIL \nL'utilisateur n'existe pas ou le password est invalide`);
            }
            const accessToken = jwt.sign({ userId: user.id }, accessTokenSecret);

            res.status(200).json({
                status: 'OK',
                data: accessToken,
                message: 'logged in'
            });
        }

        catch (err) {
            console.log(err.stack);
        };
    });
});


// créer un utilisateur dans la table des users
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
        console.log('POST | users/login | 400 | FAIL \nLe nom est inexistant ou invalide');
    }

    // vérifier le mot de passe existe
    if (password === undefined || typeof password !== typeof String()) {
        res.status(400).json({
            status: "FAIL",
            message: "Le mot de passe n'existe pas",
            data: undefined
        });
        console.log('POST | users/login | 400 | FAIL \nLe mot de passe n\'existe pas');

    }
    bcrypt.hash(password, 10, async (err, hash) => {
        // Store hash in your password DB.
        try {

            const data = await client.query('INSERT INTO users (name, password) VALUES ($1, $2) RETURNING id,name', [name, hash]);
            if (data.rowCount > 0) {
                res.status(200).json({
                    status: "SUCCESS",
                    message: `Le mot de passe de ${name} a bien été modifié`,
                    data: data.rows
                });
                console.log(`POST | /api/users/register | 200 | SUCCESS \nLe mot de passe de ${name} a bien été modifié `);

            }
        }

        catch (err) {
            console.log(err.stack);
        };
    });
});


module.exports = usersRouter;