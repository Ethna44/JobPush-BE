const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS, 
  },
  //Cette ligne désactive la vérification du certificat = non-recommandé en production
  //Mais elle est nécessaire en développement = réseau de la capsule.
  tls: {
  rejectUnauthorized: false,
}
});

function sendOfferNotification(to, offer) {
  return transporter.sendMail({
    from: process.env.MAIL_USER,
    to, 
    subject: `Une nouvelle offre pour toi !`,
    text: `Hello,\nVoici une offre qui pourrait t'intéresser !\nTitre : ${offer.title}\nDescription : ${offer.description}\nLien : ${offer.offerLink}\n\nMerci pour ta confiance et à bientôt sur JobPush !\nOn croise les doigts pour la suite de ta recherche d'emploi\n\nEthan, Tiago et Marion de JobPush`,
  });
}

module.exports = { sendOfferNotification };