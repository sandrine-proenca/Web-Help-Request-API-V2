/* cette fonction est un middleware permettant de dechiffrer le token 
et extraire l'id de l'user pour l'ajouter dans req */

const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.TOKEN_SECRET, (err, token) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.body.tokenId = token.userId;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};


module.exports = authenticateJWT;
