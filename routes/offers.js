var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
require("../models/connection");
const Offer = require("../models/offers.js");
const User = require("../models/users.js");
const { checkBody } = require("../modules/checkBody");
const city = require("../modules/citie.json");
const Application = require("../models/applications.js");

router.get("/", async (req, res) => {
  const { offset, limit, userToken } = req.query;
  const user = await User.findOne({ token: userToken });
  if (!user || !user.preferences || user.preferences.length === 0) {
    return res.json({ offers: [] });
  } // Vérifie si l'utilisateur a des préférences

  // Construit un tableau de filtres pour chaque préférence valide
  const filters = user.preferences
    .filter((pref) => pref.jobTitle) // tu peux affiner le filtre selon tes besoins
    .map((pref) => {
      const andFilter = [];

      // Contrat
      if (pref.contractType) {
        andFilter.push({ contractType: pref.contractType });
      }

      // Titre ou description
      if (pref.jobTitle) {
        const words = pref.jobTitle.split(/\s+/).filter(Boolean);
        andFilter.push({
          $and: words.map((word) => ({
            $or: [
              { title: { $regex: word, $options: "i" } },
              { description: { $regex: word, $options: "i" } },
            ],
          })),
        });
      }

      // Ville
      if (pref.city) {
        for (const c of city) {
          if (c.insee === pref.city) {
            andFilter.push({ city: c.name });
            break;
          }
        }
      }

      if(pref.sector) {
        andFilter.push({ sector: pref.sector });
      }

      // Si aucun critère, retourne {}
      return andFilter.length > 0 ? { $and: andFilter } : {};
    });
  console.dir(filters, { depth: null });

  Offer.find({ $or: filters }) // Utilise les filtres construits
    .sort({ publicationDate: -1 })
    .skip(offset)
    .limit(limit)
    .then((data) => {
      res.json({ offers: data });
    });
});

//prends un tableau d'Ids et retourne les offres correspondantes
router.post("/byIds", async (req, res) => {
  const { ids } = req.body;
  // //console.log("ids", ids, req.body);
  if (!ids || !Array.isArray(ids)) return res.json({ offers: [] });
  const offers = await Offer.find({ _id: { $in: ids } });
  res.json({ offers });
});

//ajouter une nouvelle offre dans la base de données
router.post("/add", (req, res) => {
  // Check if the required fields are present
  if (
    !checkBody(req.body, [
      "title",
      "compagny",
      "grade",
      "sector",
      "contractType",
      "publicationDate",
      "streetNumber",
      "streetName",
      "city",
      "zipCode",
      "source",
      "offerLink",
      "description",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // Create a new offer

  Offer.findOne({ offerLink: req.body.offerLink })
    .then((data) => {
      if (data) {
        // If the offer already exists, return an error
        res.json({ result: false, error: "Offer already exists" });
      } else {
        const newOffer = new Offer({
          title: req.body.title,
          compagny: req.body.compagny,
          logoLink: req.body.logoLink,
          grade: req.body.grade,
          sector:req.body.sector,
          contractType: req.body.contractType,
          publicationDate: req.body.publicationDate,
          streetNumber: req.body.streetNumber,
          streetName: req.body.streetName,
          city: req.body.city,
          zipCode: req.body.zipCode,
          source: req.body.source,
          offerLink: req.body.offerLink,
          description: req.body.description,
        });
        // Save the offer to the database
        newOffer
          .save()
          .then(() => {
            res.json({ result: true });
          })
          .catch((error) => {
            res.json({ result: false, error: error.message });
          });
      }
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
      return;
    });
});

router.get("/test", (req, res) => {
  res.json({ message: "✅ Route test ok" });
});

router.post("/applications", async (req, res) => {
  const { token, offerId } = req.body;

  try {
    console.log("✅ Route POST /offers/applications bien appelée");
    console.log("🟡 Reçu dans req.body :", req.body);

    const user = await User.findOne({ token });
    if (!user)
      return res.json({ result: false, error: "Utilisateur non trouvé" });

    // Évite les doublons
    const exists = await Application.findOne({ userId: user._id, offerId });
    if (exists)
      return res.json({ result: false, error: "Déjà candidaté à cette offre" });

    const newApp = new Application({
      userId: user._id,
      offerId,
    });

    const savedApp = await newApp.save();

    user.applications.push(savedApp._id);
    await user.save();

    res.json({
      result: true,
      message: "Candidature créée",
      application: savedApp,
    });
  } catch (e) {
    console.error(e);
    res.json({ result: false, error: e.message });
  }
});

router.get("/applications", async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token });
    if (!user)
      return res.json({ result: false, error: "Utilisateur non trouvé" });

    const applications = await Application.find({ userId: user._id }).populate(
      "offerId"
    );
    res.json({ result: true, applications });
  } catch (e) {
    console.error(e);
    res.json({ result: false, error: e.message });
  }
});

router.put("/applications/todo", async (req, res) => {
  const { offerId , token } = req.query;
  try {
    const user = await User.findOne({ token });
    const application = await Application.findOne({
      userId: user._id,
      offerId: offerId,
    });
    console.log(application)
    if (!application) {
      return res.json({ result: false, error: "Offre non trouvé" });
    } else {
      Application.updateOne(
        {userId: user._id, offerId },
        {
          $set: {
            recallDate: req.body.recallDate,
            interviewDate: req.body.interviewDate,
            TyLetterDate: req.body.TyLetterDate,
            notes: req.body.notes,
            status: req.body.status,
          },
        }
      ).then((application) => {
        if (!application || application.modifiedCount === 0) {
          return res.json({ result: false, message: "Candidature modifiée" });
        }
        res.json({ result: true, message: "Candidature bien modifié" });
      });
    }
  } catch (e) {
    console.error(e);
    res.json({ result: false, error: e.message, message :'marche pas'  });
  }
});

module.exports = router;
