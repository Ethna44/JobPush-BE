const mongoose = require("mongoose");

const ArticlesSchema = mongoose.Schema(
  {
    category: String,
    subCategory: String,
    title: String,
    description: String,
    content: String,
    link: String,
    author: String,
    tags: [String],
  },
  { timestamps: true }
);

const Article = mongoose.model("articles", ArticlesSchema);

module.exports = Article;
