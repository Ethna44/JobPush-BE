var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

require("../models/connection");
const User = require("../models/users");
const Offer = require("../models/offers.js");
const { checkBody } = require("../modules/checkBody");
const { checkPassword } = require("../modules/checkPassword");
const {
  checkPasswordStandard,
} = require("../modules/checkPasswordStandard.js");
const { checkEmailFormat } = require("../modules/checkEmailFormat.js");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["email", "password", "confirmPassword"])) {
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
  const email = req.body.email.trim().toLowerCase();
  User.findOne({ email }).then((data) => {
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
        favorites: [],
        applications: [],
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

  const email = req.body.email.trim().toLowerCase(); //Pour limiter la casse
  console.log(email);

  User.findOne({ email }).then((data) => {
    console.log(data);
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      console.log(data) *
        res.json({
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

router.get("/profile/:token", (req, res) => {
  const token = req.params.token;
  if (!token) return res.json({ result: false, message: "Token non trouvé" });
  User.find({ token })
    .then((data) => {
      if (!data) {
        return res.json({ result: false, message: "User not found" });
      }
      res.json({ result: true, preferences: data[0].preferences });
    })
    .catch((error) => {
      console.error(error);
      res.json({
        result: false,
        message: "Erreur lors de la récupération de l'utilisateur",
      });
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
    return res.json({
      result: false,
      message: "Non connecté, veuillez vous connecter",
    });
  }
  if (!checkBody(req.body, ["name", "firstName", "phoneNumber"])) {
    return res.json({
      result: false,
      message: "Veuillez verifier les champs obligatoires",
    });
  }
  console.log(req.body);

  User.updateOne(
    { token },
    {
      $set: {
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
      },
    }
  ).then((user) => {
    if (!user || user.modifiedCount === 0) {
      return res.json({ result: false, message: "User not found" });
    }
    res.json({ result: true, message: "Utilisateur bien modifié" });
  });
});

router.put("/alerts", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.json({ result: false, message: "Token non trouvé" });
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
    res.json({ result: true });
  });
});

router.post("/favorites", async (req, res) => {
  // const offerId = req.params.offerId;
  // const token = req.params.token;

  const { offerId, token } = req.body; //Destructuration

  try {
    const user = await User.findOne({ token });
    if (!user) return res.json({ result: false, error: "User does not exist" });

    const data = await Offer.findById(offerId);
    if (!data)
      return res.json({ result: false, error: "Offer already exists" }); //on vérifie que l'user existe d'abord et on recupère son ID, et on vérifie aussi que l'offre existe bie,

    user.favorites.push(offerId); // On sauvegarde  l'offerId  dans le tableau du schema User

    await user.save();

    res.json({ result: true, message: "Offre mit en favoris" });
  } catch (e) {
    console.error(e);
    res.json({ result: false, message: e.message });
  }

  //On englobe le tout avec un Try catch pour gérer toutes les erreurs et ne pas faire planter le backend

  //Code de bébé ,

  // Offer.findById(offerId).then((data) => {
  //   if (!data) return res.json({ result: false, error: "User already exists" });

  //   User.favorites.push(offerId);

  //   User.save().then(() => {
  //     res.json({ result: true, message: "Offre mit en favoris" });
  //   });
  // });
});

//IF findId is valid, then push offerId into array favorites from user

module.exports = router;
