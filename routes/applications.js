var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Application = require("../models/applications");

//créé un document application (candidature) à partir d'une offre
router.post("/applications", async (req, res) => {
  const { token, offerId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user)
      return res.json({ result: false, error: "Utilisateur non trouvé" });

    // Évite les doublons
    const exists = await Application.findOne({ userId: user._id, offerId });
    if (exists)
      return res.json({ result: false, error: "Déjà candidaté à cette offre" });

    const newApp = new Application({
      userId: user._id,
      offerId,
    });

    const savedApp = await newApp.save();

    user.applications.push(savedApp._id);
    await user.save();

    res.json({
      result: true,
      message: "Candidature créée",
      application: savedApp,
    });
  } catch (e) {
    console.error(e);
    res.json({ result: false, error: e.message });
  }
});

//récupérer les candidatures d'un utilisateur
router.get("/applications", async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token });
    if (!user)
      return res.json({ result: false, error: "Utilisateur non trouvé" });

    const applications = await Application.find({ userId: user._id }).populate(
      "offerId"
    );
    res.json({ result: true, applications });
  } catch (e) {
    console.error(e);
    res.json({ result: false, error: e.message });
  }
});

//modifie la todo list d'une candidature
router.put("/applications/todo", async (req, res) => {
  const { offerId, token } = req.query;
  try {
    const user = await User.findOne({ token });
    const application = await Application.findOne({
      userId: user._id,
      offerId: offerId,
    });
    if (!application) {
      return res.json({ result: false, error: "Offre non trouvé" });
    } else {
      Application.updateOne(
        { userId: user._id, offerId },
        {
          $set: {
            recallDate: req.body.recallDate,
            interviewDate: req.body.interviewDate,
            TyLetterDate: req.body.TyLetterDate,
            notes: req.body.notes,
            status: req.body.status,
          },
        }
      ).then((application) => {
        if (!application || application.modifiedCount === 0) {
          return res.json({ result: false, message: "Candidature modifiée" });
        }
        res.json({ result: true, message: "Candidature bien modifié" });
      });
    }
  } catch (e) {
    console.error(e);
    res.json({ result: false, error: e.message, message: "marche pas" });
  }
});

module.exports = router;