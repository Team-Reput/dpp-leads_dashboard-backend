// Routes just map a URL + HTTP method to a controller function.
// No logic lives here — that's what controllers are for.

const express = require("express");
const router = express.Router();
const { login } = require("../controllers/auth.controller");

router.post("/login", login);

module.exports = router;