require("dotenv").config();
require('./checkOffers');

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var usersRouter = require("./routes/users");
var offersRouter = require("./routes/offers")
var articlesRouter = require("./routes/articles");
var applicationsRouter = require("./routes/applications")

var app = express();

const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use("/offers",offersRouter)
app.use("/articles", articlesRouter);
app.use("/applications", applicationsRouter)

module.exports = app;
