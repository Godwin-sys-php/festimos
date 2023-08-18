const bcrypt = require("bcrypt");
const Organisator = require("../Models/Organisator");
const Users = require("../Models/Users");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = async (req, res) => {
  try {
    console.log("hey");
    const { username, password } = req.body;
    const user = await Users.customQuery(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (user.length == 0)
      return res.status(400).json({
        username: false,
        password: false,
        message: "Nom d'utilisateur inexistant",
      });

    if (!bcrypt.compareSync(password, user[0].password)) {
      return res.status(400).json({
        username: true,
        password: false,
        message: "Mot de passe incorrect",
      });
    }
    const organization = await Organisator.findOne({ id: user[0].organisatorId, })
    return res.status(200).json({
      logged: true,
      user: { ...user[0], password: undefined | null },
      organisation: organization[0],
      token: jwt.sign(
        { ...user[0], password: undefined | null },
        process.env.TOKEN_ORG,
        {
          expiresIn: 604800 * 7, // 7 weeks
        }
      ),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Une erreur inconnu a eu lieu" });
  }
};
