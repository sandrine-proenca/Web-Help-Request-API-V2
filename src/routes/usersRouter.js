const express = require('express');
const client = require ('../client');

const usersRouter = express.Router();


    // récupération du tableau de tous les utilisateurs
    usersRouter.get('/', async (req, res) => {
        try {
            const data = await client.query('SELECT id, name FROM users');

            res.json(data.rows);
        }
        catch (err) {
            console.log(err.stack);
        }
    });

    // récupération d'un utilisateurs défini
    usersRouter.get('/:id', async (req, res) => {
        console.log(req.params);
        const id = req.params.id;

        try {
            const data = await client.query('SELECT id, name FROM tickets where id = $1', [id]);

            res.json(data.rows);
        }
        catch (err) {
            console.log(err.stack);
        }
    });

    // créer un utilisateur dans la table des users
    usersRouter.post('/', async (req, res) => {
        console.log("test", req.body);

        try {
            const name = req.body.name;

            const data = await client.query('INSERT INTO users (name) VALUES ($1) RETURNING *', [name]);

            res.json(data.rows);
        }
        catch (err) {
            console.log(err.stack);
        }
    });

    // modification d'un utilisateur défini et les messages d'erreur
    usersRouter.put('/:id', async (req, res) => {
        console.log(req.params);
        const name = req.body.name;
        const id = req.params.id;

        if (!(id && name)) {
            res.status(400).json({
                status: "FAIL",
                message: "Structure incorrect, pas de n°id et pas de nom",
                data: undefined
            });
            console.log(`PUT | /users/:id | 400 | FAIL \n Structure incorrect, pas de n°id et pas de nom`);
        }

        try {
            const data = await client.query('UPDATE users SET name =$1  WHERE id =$2 RETURNING*', [name, id]);

            if (data.rowCount > 0) {
                res.status(200).json({
                    status: "SUCCESS",
                    message: `L'utilisateur ${id} a bien été modifié`,
                    data: data.rows
                });
                console.log(`PUT | /users/:id | 200 | SUCCESS \nL'utilisateur ${id} a bien été modifié `);
            } else {
                res.status(400).json({
                    status: "FAIL",
                    message: `L'utilisateur ${id} n'existe pas`,
                    data: undefined
                });
                console.log(`PUT | /users/:id | 400 | FAIL \nL'utilisateur ${id} n'existe pas `);
            }

        }
        catch (err) {
            res.status(500).json({
                status: "FAIL",
                message: "Serveur introuvable",
                data: undefined
            });
            console.log(`PUT | /users/:id | 400 | FAIL \n${err.stack}`);
        }
    });

    // suppression d'un utilisateur défini dans la table users
    usersRouter.delete('/:id', async (req, res) => {
        console.log(req.params);
        const id = req.params.id;


        try {
            // supprimer les tickets correspondant aux users supprimer
            await client.query('DELETE FROM tickets WHERE user_id = $1 ', [id]);
            // supprimer le users sélectionné
            const data = await client.query('DELETE FROM users WHERE id = $1 RETURNING*', [id]);
            res.json(data.rows);

            

        }
        catch (err) {
            console.log(err.stack);
        }
    });

    module.exports = usersRouter;