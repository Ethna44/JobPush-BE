var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/users");
const Offer = require("../models/offers");
const { checkBody } = require("../modules/checkBody");
const { checkPassword } = require("../modules/checkPassword");
const { checkPasswordStandard } = require("../modules/checkPasswordStandard");
const { checkEmailFormat } = require("../modules/checkEmailFormat");

//route d'inscription
router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["email", "password", "confirmPassword"])) {
    res.json({ result: false, error: "Champs manquants" });
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

  //Vérifie si l'utilisateur n'est pas déjà inscrit
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
      res.json({ result: false, error: "L'utilisateur existe déjà en base de données" });
    }
  });
});

//route de connexion
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({ result: false, error: "Champs manquants" });
  }
  const checkEmailResult = checkEmailFormat(req.body.email);
  if (!checkEmailResult.result) {
    return res.json(checkEmailResult);
  }

  const email = req.body.email.trim().toLowerCase(); //Pour limiter la casse
 User.findOne({ email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      const newToken = uid2(32);

      User.findOneAndUpdate(
        { email },
        { token: newToken },
        { new: true }
      ).then((data) => {
        res.json({
          result: true,
          token: newToken,
        email: data.email,
        firstName: data.firstName,
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
        preferences: data.preferences,
        alerts: data.alerts,
        favorites: data.favorites,
        applications: data.applications,
        msg: "Accès autorisé",
      });
      });
    } else {
      res.json({ result: false, error: "Utilisateur non trouvé ou mot de passe invalide" });
    }
  });
});

//route de déconnexion
router.put("/logout", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.json({ result: false, error: "Token manquant" });
  }

  User.findOneAndUpdate({ token }, { token: null }).then((user) => {
    if (user) {
      res.json({ result: true, message: "Utilisateur déconnecté avec succès" });
    } else {
      res.json({ result: false, error: "Token invalide" });
    }
  });
});


//récupérer les infos d'un utilisateur via son token
router.get("/profile/:token", async (req, res) => {
  const token = req.params.token;
  if (!token) return res.json({ result: false, message: "Token non trouvé" });
  try {
    const user = await User.findOne({ token });
    if (!user) return res.json({ result: false, error: "Utilisateur non trouvé" });

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

//route qui modifie le document utilisateur avec ses infos et ses préférences de recherche d'emploi
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
      return res.json({ result: false, message: "Utilisateur non trouvé" });
    }
    res.json({ result: true, message: "Document utilisateur modifié avec succès" });
  });
});

//
router.put("/alerts", async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.json({ result: false, message: "Token non trouvé" });
  }

  try {
    const result = await User.updateOne(
      { token },
      { $set: { alerts: req.body.alerts } }
    );
    if (!result || result.modifiedCount === 0) {
      return res.json({
        result: false,
        message: "User not found or not updated",
      });
    }
    res.json({ result: true, alerts: req.body.alerts });
  } catch (e) {
    res.json({ result: false, message: "Erreur serveur" });
  }
});

//route qui lie des favoris à un utilisateur
router.post("/favorites", async (req, res) => {
  const { offerId, token } = req.body;
  try {
    //vérifie que l'utilisateur est bien connecté
    const user = await User.findOne({ token });
    if (!user) return res.json({ result: false, error: "Utilisateur non trouvé" });

    //vérifie que l'offre existe toujours
    const data = await Offer.findById(offerId);
    if (!data)
      return res.json({ result: false, error: "Offre non trouvée" });

    //vérifie si l'offre est déjà dans les favoris avant de pousser son objectId 
    //dans le tableau des favoris de l'utilisateur car on ne veut pas de doublons
    if (user.favorites.includes(offerId)) {
      return res.json({ result: false, error: "Offre déjà dans les favoris" });
    }

    user.favorites.push(offerId); // On sauvegarde  l'offerId  dans le tableau favorites du user si result=true

    await user.save();

    res.json({ result: true, message: "Offre mise en favoris" });
  } catch (e) {
    console.error(e);
    res.json({ result: false, message: e.message });
  }
});

//route qui supprime les favoris d'un utilisateur
router.put("/favorites/remove", async (req, res) => {
  const { offerId, token } = req.body;
  const user = await User.findOne({ token });

  if (!token) {
    return res.json({ result: false, message: "Token non trouvé" });
  }
  //vérifie si l'offre est bien dans les favoris avant de supprimer son objectId dans le tableau des favoris du user
  if (!user.favorites.includes(offerId)) {
    return res.json({
      result: false,
      error: "L'offre n'est pas dans les favoris",
    });
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

//route pour supprimer un compte utilisateur
router.delete("/:token", async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({
      token: req.params.token,
    });
    if (!deletedUser) {
      return res
        .status(404)
        .json({ result: false, error: "Utilisateur non trouvé" });
    }
    res.json({ result: true, message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

//route afin de créer une nouvelle préfèrence en terme de critères de recherche d'emploi
router.post("/addPreferences", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.json({
      result: false,
      message: "Non connecté, veuillez vous connecter",
    });
  }

  const idPreference = new mongoose.Types.ObjectId(); //Cette ligne crée un nouvel identifiant unique en utilisant la classe `ObjectId` de Mongoose

  User.updateOne(
    { token },
    {
      $push: {
        preferences: {
           _id: idPreference,
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
      return res.json({ result: false, message: "Utilisateur non trouvé" });
    }
    res.json({ result: true, message: "Utilisateur bien modifié", _id : idPreference  });
  });
});

router.get("/preferences/:token", async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.json({ result: false, message: "Token non trouvé" });
  }

  try {
    const user = await User.find().findOne({ token });
    res.json({
      result: true,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Erreur de récupération des préférences", error);
    res.json({
      result: false,
      error: "Erreur lors de la récupération des préférences",
    });
  }
});

//route pour supprimer une préférence d'un utilisateur 
router.put("/preference/remove", async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.json({
      result: false,
      message: "Non connecté, veuillez vous connecter",
    });
  }

  try {
    const result = await User.updateOne(
      { token: token },
      {
        $pull: {
          preferences: {
            _id: req.body._id
          },
        },
      }
    ); //Permet de retirer un element du tableau

    if (result.modifiedCount === 0) {
      return res.json({
        result: false,
        message: "Offre non trouvée dans les favoris.",
      });
    }

    res.json({ result: true, message: "Recherche supprimée des préférences" });
  } catch (e) {
    console.error(e);
    res.json({ result: false, message: e.message });
  }
});

module.exports = router;
