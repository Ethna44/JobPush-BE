var express = require("express");
var router = express.Router();
const Article = require("../models/articles");

//récupère les articles selon leur catégorie (sujet)
router.get("/byCategory/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const articles = await Article.find({ category: category });
    res.json({ result: true, articles: articles });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});
 
//récupère les articles selon leurs tags
router.get("/byTags", async (req, res) => {
  try {
    // ?tags=mot1,mot2
    const tags = req.query.tags ? req.query.tags.split(",") : [];
    const articles = await Article.find({ tags: { $in: tags } }); //La requête `{ tags : { $in : tags } }` utilise l'opérateur `$in` de MongoDB, qui vérifie si l'une des valeurs du tableau `tags` existe dans le champ `tags` de chaque document.
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
