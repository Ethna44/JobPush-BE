var express = require("express");
var router = express.Router();
const Article = require("../models/articles");

router.get("/byCategory/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const articles = await Article.find({ category: category });
    const data = articles.map((a) => ({
      title: a.title,
      description: a.description,
    }));
    res.json({ result: true, articles: data });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});
module.exports = router;
