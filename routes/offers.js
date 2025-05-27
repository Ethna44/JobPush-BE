var express = require("express");
var router = express.Router();
require("../models/connection");
const Offer = require("../models/offers.js");
const User = require("../models/users.js");
const { checkBody } = require("../modules/checkBody");

router.get("/", async (req, res) => {
  const { offset, limit, userToken } = req.query;
  const user = await User.findOne({ token: userToken });
  const pref = user.preferences[user.preferences.length - 1];
const filter = {};
if (pref.contractType) filter.contractType = pref.contractType;



  Offer.find(filter)
    .sort({ publicationDate: -1 }) // Sort by publication date, most recent first
    .skip(offset)
    .limit(limit)
    .then((data) => {
      res.json({ offers: data });
    });
});

router.post("/add", (req, res) => {
  // Check if the required fields are present
  if (
    !checkBody(req.body, [
      "title",
      "compagny",
      "grade",
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

module.exports = router;
