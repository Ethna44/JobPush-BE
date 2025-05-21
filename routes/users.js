var express = require("express");
var router = express.Router();

const uid2 = require("uid2");

const bcrypt = require("bcrypt");

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const { checkPassword } = require("../modules/checkPassword");
const { checkPasswordStandard } = require("../modules/checkPasswordStandard.js");
const { checkEmailFormat } = require("../modules/checkEmailFormat.js");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["email", "password","confirmPassword"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const checkEmailResult = checkEmailFormat(req.body.email);
  if (!checkEmailResult.result) {
    return res.json(checkEmailResult);
  }
  const checkPasswordStandardResult = checkPasswordStandard(req.body.password);
  if (!checkPasswordStandardResult.result) {
    return res.json(checkPasswordStandardResult);
  }
  const checkPasswordResult = checkPassword(
    req.body.password,
    req.body.confirmPassword
  );
  if (!checkPasswordResult.result) {
    return res.json(checkPasswordResult);
  }

  // Check if the user has not already been registered
  const email = req.body.email.trim().toLowerCase()
  User.findOne({ email} ).then((data) => {
    const hash = bcrypt.hashSync(req.body.password, 10);
    if (data === null) {
      const newUser = new User({
        email: email,
        password: hash,
        token: uid2(32),
        name: null,
        firstName: null,
        phoneNumber: null,
        address: [
          {
            streetNumber: null,
            streetName: null,
            city: null,
            zipCode: null,
          },
        ],
        preferences: [
          {
            jobTitle: null,
            sector: null,
            contractType: null,
            remote: null,
            city: null,
            region: null,
            // createdAt: null, PLUS BESOIN DE CREER CAR GENERER AUTOMATIQUEMENT DANS LE SCHEMA
            // updatedAt: null,
          },
        ],

        alerts: null,
        favorites : [],
        applications : [],
     // ou  createdAt : Date.now(), si on avait pas déjà automatisé via le Schema la data ( { type: Date, default: Date.now }  )
        // updatedAt : null,
        
      });

      newUser.save().then(() => {
        res.json({ result: true, token: newUser.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User already exists" });
    }
  });
});






router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  const email = req.body.email.trim().toLowerCase() //Pour limiter la casse
  console.log(email)

    User.findOne({ email }).then((data) => {
    console.log(data)
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        console.log(data)
  *      res.json({
          result: true,
          token: data.token,
          email: data.email,
          msg: "Access Granted",
        });
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

router.put("/", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.json({ result: false, message: "Pas find" });
  }
  User.updateOne(
    { token },
    {
      name: req.body.name,
      firstName: req.body.firstName,
      phoneNumber: req.body.phoneNumber,
      address: [
        {
          streetNumber: req.body.streetNumber,
          streetName: req.body.streetName,
          city: req.body.city,
          zipCode: req.body.zipCode,
        },
      ],
      preferences: [
        {
          jobTitle: req.body.jobTitle,
          sector: req.body.sector,
          contractType: req.body.contractType,
          remote: req.body.remote,
          city: req.body.cityJob,
          region: req.body.region,
        },
      ],
    }
  ).then((user) => {
    if (!user) {
      return res.json({ result: false, message: "User not found" });
    }
    res.json({ result: true, message: user });
  });
});

router.put("/alerts", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.json({ result: false, message: "Pas find" });
  }
  User.updateOne(
    { token },
    {
      alerts: req.body.alerts,
    }
  ).then((user) => {
    if (!user) {
      return res.json({ result: false, message: "User not found" });
    }
    res.json({ result: true,});
  });
});

module.exports = router;
