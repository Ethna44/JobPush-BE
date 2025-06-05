var express = require("express");
var router = express.Router();
const Offer = require("../models/offers");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const city = require("../modules/citie");
const Application = require("../models/applications");
 
//acéder à une ou plusieurs offres selon des critères
router.get("/", async (req, res) => {
  const { offset, limit, userToken } = req.query;
  const user = await User.findOne({ token: userToken });
  if (!user || !user.preferences || user.preferences.length === 0) {
    return res.json({ offers: [] });
  } // Vérifie si l'utilisateur a des préférences

  const filters = user.preferences
    .filter((pref) => pref)
    .map((pref) => {
      const andFilter = [];
      // Type de cntrat
      if (pref.contractType) {
        andFilter.push({ contractType: pref.contractType });
      }

      // Titre du poste ou description
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

      // Ville où se situe l'entreprise
      if (pref.city) {
        for (const c of city) {
          if (c.insee === pref.city) {
            andFilter.push({ city: c.name });
            break;
          }
        }
      }
       //Secteur d'activité
      if (pref.sector) {
        andFilter.push({ sector: pref.sector });
      }

      //Si aucun critère, retourne {}
      return andFilter.length > 0 ? { $and: andFilter } : {};
    });

  Offer.find({ $or: filters }) // Utilise les filtres construits
    .sort({ publicationDate: -1 })
    .skip(offset)
    .limit(limit)
    .then((data) => {
      res.json({ offers: data });
    });
});

//prends un tableau d'Id et retourne les offres correspondantes
router.post("/byIds", async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.json({ offers: [] });
  const offers = await Offer.find({ _id: { $in: ids } });
  res.json({ offers });
});

//ajoute une nouvelle offre dans la base de données
router.post("/add", (req, res) => {
  // Vérifie si les champs obligatoires sont présents
  if (
    !checkBody(req.body, [
      "title",
      "compagny",
      "grade",
      // "sector",
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
    console.error("post offers /add", "Missing or empty fields");
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  //Créé une nouvelle offre
  Offer.findOne({ offerLink: req.body.offerLink })
    .then((data) => {
      if (data) {
        console.error("post offers /add", "Offer already exists");

        //Si l'offre exise déjà, on retourne un message d'erreur
        res.json({ result: false, error: "Offer already exists" });
      } else {
        const newOffer = new Offer({
          title: req.body.title,
          compagny: req.body.compagny,
          logoLink: req.body.logoLink,
          grade: req.body.grade,
          sector: req.body.sector,
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
        //Enregistre la nouvelle offre en base de données
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
      console.error("post offers /add", error.message);

      res.json({ result: false, error: error.message });
      return;
    });
});

module.exports = router;
