var express = require("express");
var router = express.Router();

const uid2 = require("uid2");

const bcrypt = require("bcrypt");

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const { checkPassword} = require('../modules/checkPasswords');

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["firstname","username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ username: req.body.username }).then((data) => {
    const hash = bcrypt.hashSync(req.body.password, 10);
    if (data === null) {
      const newUser = new User({
       firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: uid2(32),
      });
      if(checkPassword(req.body.password)) {

      newUser.save().then(() => {
        res.json({ result: true , token: newUser.token});
      });}
    } else {
      // User already exists in database
      res.json({ result: false, error: "User already exists" });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    console.log(req.body.username);
    console.log(req.body.password);
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token,firstname:data.firstname, msg: "Access Granted" });
    } else {
      res.json({ result: false, msg: "User not found" });
    }
  });
});

// router.get("/canBookmark/:token", (req, res) => {
//   User.findOne({ token: req.params.token }).then((data) => {
//     if (!data) {
//       return res.json({ result: false });
//     }

//     res.json({ result: true, canBookmark: data.canBookmark });
//   });
// });

module.exports = router;
