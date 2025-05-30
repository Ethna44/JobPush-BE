console.log("Script checkOffers.js lancé !");

const cron = require("node-cron");
const Offer = require("./models/offers");
const User = require("./models/users");
const { sendOfferNotification } = require("./modules/mailer");

// Stocke les IDs des offres déjà notifiées pour éviter les doublons
let notifiedOfferIds = new Set();

cron.schedule("* * * * *", async () => { // toutes les minutes
    try {
        console.log("⏰ Vérification des nouvelles offres...");

        // Récupère les offres récentes (ex: postées dans les 15 dernières minutes)
        const since = new Date(Date.now() - 15 * 60 * 1000);
        const newOffers = await Offer.find({ publicationDate: { $gte: since } });

        for (const user of await User.find({})) {
            if (!user.preferences || user.preferences.length === 0) continue;

            for (const offer of newOffers) {
            if (notifiedOfferIds.has(offer._id.toString())) continue;

            // Vérifie si l'offre correspond à au moins une préférence de l'utilisateur
            const match = user.preferences.some(pref => {
                if (pref.contractType && offer.contractType !== pref.contractType) return false;
                if (pref.city && offer.city !== pref.city) return false;
                if (pref.jobTitle && !offer.title.toLowerCase().includes(pref.jobTitle.toLowerCase())) return false;
                return true;
            });

            if (match) {
                await sendOfferNotification(user.email, offer);
                notifiedOfferIds.add(offer._id.toString());
                console.log(`✉️ Mail envoyé à ${user.email} pour l'offre ${offer.title}`);
            }
            }
        }
    } catch (e) {
    console.error("Erreur dans le cron :", e);
    }
});