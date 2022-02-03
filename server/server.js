import "@babel/polyfill";

const dotenv = require('dotenv');
const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const helmet = require('helmet');

// body parser for post req
const bodyParser = require('body-parser');

// parse body post request
app.use(bodyParser.urlencoded({
    extended: true
}));

// parse application/json body post request
app.use(bodyParser.json())

// use helmet for security
app.use(helmet());
// deactivate the recognition of applications with Express Server
app.disable('x-powered-by');

// jwt token import
const {generateAccessToken, generateRefreshToken, authenticateToken} = require('./helpers/jwt');

// get config vars
dotenv.config();

app.post("/api/token", async (req, res) => {
    try {
        const grant_type = req.body.grant_type;
        const refresh_token = req.body.refresh_token;
        const user_mail = req.body.user_mail;

        // TODO -> check in database if refresh_token and user_mail match then generate new access_token
        if (grant_type === 'refresh_token') {

            // generate access token
            const token = await generateAccessToken({username: req.body.username});
            const refresh_token = await generateRefreshToken();

            const response = {
                "token_type": "bearer",
                "access_token": token,
                "expires_in": process.env.JWT_EXPIRES,
                "refresh_token": refresh_token,
                "user_mail": ""
            }
            res.json(response);

        }
    } catch (e) {
        res.status(403).send("Forbidden");
    }
});

app.post("/api/createNewUser", async (req, res) => {
    // generate access token
    const token = await generateAccessToken({username: req.body.username});
    const refresh_token = await generateRefreshToken();
    const response = {
        "token_type": "bearer",
        "access_token": token,
        "expires_in": process.env.JWT_EXPIRES,
        "refresh_token": refresh_token,
        "user_mail": ""
    }
    res.json(response);
});

app.get("/api", authenticateToken, async (req, res) => {
    res.json({message: "Hello from server!"});
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});