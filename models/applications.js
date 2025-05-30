const mongoose = require("mongoose");
const Offer = require("./offers");
const User = require ("./users")

const applicationSchema = new mongoose.Schema({
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: "offers", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  recallDate: { type: String, default: null },
  interviewDate: { type: String, default: null },
  TyLetterDate: { type: String, default: null },
  applicationDate: { type: Date, default: Date.now }, // ou null
  status: { type: String, default: "en attente" },
  notes: { type: String, default: "" },
});


const Application = mongoose.model("applications", applicationSchema);

module.exports = Application;
