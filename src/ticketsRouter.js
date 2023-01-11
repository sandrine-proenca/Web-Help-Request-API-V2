// IMPORTS

const express = require('express');

const ticketsRouter = express.Router();

    // ROUTE : table des tickets

    // récupération du tableau de tous les tickets établis
    ticketsRouter.get('/', async (req, res) => {
        try {
            const data = await client.query('SELECT * FROM tickets');

            res.json(data.rows);
        }
        catch (err) {
            console.log(err.stack)
        }

    });

    // récupération d'un ticket défini
    ticketsRouter.get('/:id', async (req, res) => {
        console.log(req.params);
        const id = req.params.id;

        try {
            const data = await client.query('SELECT * FROM tickets where id = $1', [id]);

            res.json(data.rows);
        }
        catch (err) {
            console.log(err.stack)
        }
    });


    // création d'un ticket dans la table tickets
    ticketsRouter.post('/', async (req, res) => {
        console.log("test", req.body);

        const { problem, done, user_id } = req.body;

        if (problem === undefined || typeof problem !== typeof String()) {
            res.status(400).json({
                status: "FAIL",
                message: "Obligation d'avoir un PROBLEM en string",
                data: undefined
            });
            console.log(`POST | /tickets | 400 | FAIL \nObligation d'avoir un PROBLEM en string`);
            return;
        }
        if (done === undefined || typeof done !== typeof Boolean()) {
            res.status(400).json({
                status: "FAIL",
                message: "Obligation d'avoir un DONE en boolean",
                data: undefined
            });
            console.log(`POST | /tickets | 400 | FAIL \nObligation d'avoir un DONE en boolean`);
            return;
        }
        if (user_id === undefined || typeof user_id !== typeof Number() || user_id % 1 !== 0) {
            res.status(400).json({
                status: "FAIL",
                message: "Obligation d'avoir un USER_ID en nombre entier",
                data: undefined
            });
            console.log(`POST | /tickets | 400 | FAIL \nObligation d'avoir un USER_ID en nombre entier`);
            return;
        }

        try {

            const userList = await client.query('SELECT * FROM users WHERE id = $1;', [user_id])

            if (userList.rowCount === 0) {
                res.status(400).json({
                    status: "FAIL",
                    message: "Le USER n'existe pas dans le tableau des users",
                    data: undefined
                });
                console.log(`POST | /tickets | 400 | FAIL \nLe USER n'existe pas dans le tableau des users`);
                return;
            }
            const data = await client.query('INSERT INTO tickets (problem, done, user_id) VALUES ($1, $2, $3) RETURNING *', [problem, done, user_id]);

            res.json(data.rows);
        }
        catch (err) {
            console.log(err.stack);
        }
    });

    



    // modification d'un ticket défini et les messages d'erreur
    ticketsRouter.put('/:id', async (req, res) => {
        console.log(req.params);
        const problem = req.body.problem;
        const done = req.body.done;
        const id = req.params.id;

        if (!(id && (problem || done !== undefined))) {
            res.status(400).json({
                status: "FAIL",
                message: "Structure incorrect",
                data: undefined
            }),
                console.log(`PUT | /tickets/:id | 400 | FAIL \n Structure incorrect`);
        }

        try {
            const data = await client.query('UPDATE tickets SET problem =$1, done =$2 WHERE id =$3 RETURNING*', [problem, done, id]);

            if (data.rowCount > 0) {
                res.status(200).json({
                    status: "SECCESS",
                    message: `Le ticket ${id} a bien été modifié`,
                    data: data.rows
                });
                console.log(`PUT | tickets/:id | 200 | SUCCESS \nLe ticket ${id} a bien été modifié `);
            } else {
                res.status(400).json({
                    status: "FAIL",
                    message: `Le ticket ${id} n'existe pas`,
                    data: undefined
                });
                console.log(`PUT | tickets/:id | 400 | FAIL \nLe ticket ${id} n'existe pas `);
            }

        }
        catch (err) {
            res.status(500).json({
                status: "FAIL",
                message: "Serveur introuvable",
                data: undefined
            });
            console.log(`PUT | tickets/:id | 400 | FAIL \n${err.stack}`);
        }
    });



    //suppression d'un ticket dans la table tickets
    ticketsRouter.delete('/:id', async (req, res) => {
        console.log(req.params)
        const id = req.params.id;

        try {
            const data = await client.query('DELETE FROM tickets where id = $1 RETURNING*', [id]);

            res.json(data.rows);
        }
        catch (err) {
            console.log(err.stack);
        }
    });

    module.exports = ticketsRouter;