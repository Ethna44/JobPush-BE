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

//route d'inscription
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
        address: [],
        preferences: [],
        alerts: null,
        favorites: [],
        applications: [],
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

//route de connexion
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }
  const checkEmailResult = checkEmailFormat(req.body.email);
  if (!checkEmailResult.result) {
    return res.json(checkEmailResult);
  }

  const email = req.body.email.trim().toLowerCase(); //Pour limiter la casse
  console.log(email);

  User.findOne({ email }).then((data) => {
    console.log(data);
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      console.log(data);
      res.json({
        result: true,
        token: data.token,
        email: data.email,
        msg: "Access Granted",
      });
    } else {
      res.json({ result: false, error: "User not found, or Invalid password" });
    }
  });
});

//récupérer les infos d'un utilisateur via son token
router.get("/profile/:token", async (req, res) => {
  const token = req.params.token;
  if (!token) return res.json({ result: false, message: "Token non trouvé" });
  try {
    const user = await User.findOne({ token });
    if (!user) return res.json({ result: false, error: "User not found" });

    res.json({
      result: true,
      name: user.name,
      firstName: user.firstName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      preferences: user.preferences,
      alerts: user.alerts,
      favorites: user.favorites, // pour récupérer le tableau de favoris
    });
  } catch (error) {
    res.json({ result: false, error: error.message });
  }
});

// router.get("/canBookmark/:token", (req, res) => {
//   User.findOne({ token: req.params.token }).then((data) => {
//     if (!data) {
//       return res.json({ result: false });
//     }

//     res.json({ result: true, canBookmark: data.canBookmark });
//   });
// });

//
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
      },
      $push: {
        preferences: {
          jobTitle: req.body.jobTitle,
          sector: req.body.sector,
          contractType: req.body.contractType,
          remote: req.body.remote,
          city: req.body.cityJob,
          region: req.body.region,
        },
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
    //optionnel : vérifie que l'utilisateur est bien connecté 
    const user = await User.findOne({ token });
    if (!user) return res.json({ result: false, error: "User does not exist" });
    
    //optionel : vérifie que l'offre existe toujours
    const data = await Offer.findById(offerId);
    if (!data)
      return res.json({ result: false, error: "Offer does not exists" }); //on vérifie que l'user existe d'abord et on recupère son ID, et on vérifie aussi que l'offre existe bie,

    //vérifie si l'offre est déjà dans les favoris avant de pousser son objectId dans le tableau des favoris du user
    if (user.favorites.includes(offerId)) {
      return res.json({ result: false, error: "Offre déjà dans les favoris" });
    }

    user.favorites.push(offerId); // On sauvegarde  l'offerId  dans le tableau favorites du user

    await user.save();

    res.json({ result: true, message: "Offre mise en favoris" });
  } catch (e) {
    console.error(e);
    res.json({ result: false, message: e.message });
  }
});

router.put("/favorites/remove", async (req, res) => {
   const { offerId, token } = req.body;
   const user = await User.findOne({ token });

  if (!token) {
    return res.json({ result: false, message: "Token non trouvé" });
  }
  //vérifie si l'offre est déjà dans les favoris avant de pousser son objectId dans le tableau des favoris du user
    if (!user.favorites.includes(offerId)) {
      return res.json({ result: false, error: "L'offre n'est pas dans les favoris" });
    }
  try {
    const result = await User.updateOne(
      { token: token },
      { $pull: { favorites: offerId } }
    ); //Permet d'update un element du tableau sans avoir à sauvegarder en recréeant un nouveau tableau.

    if (result.modifiedCount === 0) {
      return res.json({
        result: false,
        message: "Offre non trouvée dans les favoris.",
      });
    }

    res.json({ result: true, message: "Offre supprimée des favoris" });
  } catch (e) {
    console.error(e);
    res.json({ result: false, message: e.message });
  }
});

//IF findId is valid, then push offerId into array favorites from user
//IF findId is valid, then push offerId into array favorites from user

router.post("/google-login", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.json({ result: false, error: "Missing Google access token" });
  }

  try {
    // Récupération des infos utilisateur depuis Google
    const googleUserRes = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const googleUser = await googleUserRes.json();

    if (!googleUser.email) {
      return res.json({
        result: false,
        error: "Failed to retrieve Google user info",
      });
    }

    const email = googleUser.email.trim().toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      // Création d’un nouvel utilisateur Google
      user = new User({
        email,
        password: null, // pas de mot de passe
        token: uid2(32),
        name: googleUser.family_name || null,
        firstName: googleUser.given_name || null,
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
          },
        ],
        alerts: null,
        favorites: [],
        applications: [],
      });

      await user.save();
    }

    res.json({ result: true, token: user.token, email: user.email });
  } catch (error) {
    console.error("Google login error:", error);
    res.json({ result: false, error: "Server error during Google login" });
  }
});

<<<<<<< HEAD
router.post("/addPreferences", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.json({
      result: false,
      message: "Non connecté, veuillez vous connecter",
    });
  }

  User.updateOne(
    { token },
    {
      $push: {
        preferences: {
          jobTitle: req.body.jobTitle,
          sector: req.body.sector,
          contractType: req.body.contractType,
          remote: req.body.remote,
          city: req.body.cityJob,
          region: req.body.region,
        },
      },
    }
  ).then((user) => {
    if (!user || user.modifiedCount === 0) {
      return res.json({ result: false, message: "User not found" });
    }
    res.json({ result: true, message: "Utilisateur bien modifié" });
  });
});

module.exports = router;
=======
module.exports = router;
>>>>>>> 0449e052dfcbacc5a20333dbfcd12fe2f2575cd1
