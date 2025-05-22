var express = require("express");
var router = express.Router();
require("../models/connection");
const Offer = require("../models/offers.js");
const { checkBody } = require("../modules/checkBody");

router.get('/', (req, res) => {
	Offer.find().then(data => {
		res.json({ offers: data });
	});
});

router.post('/add', (req, res) => {
	// Check if the required fields are present
	if (!checkBody(req.body, ["title", "compagny","grade", "contractType", "publicationDate", "streetNumber", "streetName", "city", "zipCode", "source", "offerLink", "description"])) {
		res.json({ result: false, error: 'Missing or empty fields' });
		return;
	}
	// Create a new offer
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
		description: req.body.description
	});
	// Save the offer to the database
	newOffer.save().then(() => {
		res.json({ result: true });
	}).catch((error) => {
		res.json({ result: false, error: error.message });
	});
	
})


module.exports = router;