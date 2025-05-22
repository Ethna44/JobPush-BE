var express = require("express");
var router = express.Router();

require("../models/connection");
const Offer = require("../models/offers.js");




router.get('/', (req, res) => {
	Offer.find().then(data => {
		res.json({ offers: data });
	});
});


module.exports = router;