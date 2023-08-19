const router = require("express").Router();
const Users = require("../Controllers/Users");


router.post("/login", Users.login);
router.get("/test/:slug", Users.test);

module.exports = router;

