const mongoose = require("mongoose");
const Offer = require("./offers");

const applicationSchema = mongoose.Schema({
  Offer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "offers",
    },
  ],
  RecallDate: Date,
  InterviewDate: Date,
  Status: Boolean,
  Notes: String,
  TyLetterDate: Date,
});

const Application = mongoose.model("Applications", applicationSchema);

module.exports = Application;
