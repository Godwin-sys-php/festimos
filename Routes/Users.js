const router = require("express").Router();
const Users = require("../Controllers/Users");


router.post("/login", Users.login);

module.exports = router;

