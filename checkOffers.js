console.log("Script checkOffers.js lancé !");

const cron = require("node-cron");
const Offer = require("./models/offers");
const User = require("./models/users");
const { sendOfferNotification } = require("./modules/mailer");

// Stocke les IDs des offres déjà notifiées pour éviter les doublons
let notifiedOfferIds = new Set();

cron.schedule("0 18 * * *", async () => { // tous les jours à 18h
    try {
        console.log("⏰ Vérification des nouvelles offres...");

        // Calcule la date d'hier à 18h
        const now = new Date();
        const since = new Date(now);
        since.setDate(now.getDate() - 1);
        since.setHours(18, 0, 0, 0);

        const newOffers = await Offer.find({ publicationDate: { $gte: since } });

        for (const user of await User.find({})) {
            if (!user.preferences || user.preferences.length === 0) continue;

            // Filtre les offres qui matchent au moins une préférence de l'utilisateur
            const matchedOffers = newOffers.filter(offer =>
                user.preferences.some(pref => {
                    if (pref.contractType && offer.contractType !== pref.contractType) return false;
                    if (pref.city && offer.city !== pref.city) return false;
                    if (pref.jobTitle && !offer.title.toLowerCase().includes(pref.jobTitle.toLowerCase())) return false;
                    return true;
                })
            );

            if (matchedOffers.length > 0) {
                await sendOfferNotification(user.email, matchedOffers);
                console.log(`✉️ Mail envoyé à ${user.email} pour ${matchedOffers.length} offres`);
            }
        }
    } catch (e) {
        console.error("Erreur dans le cron :", e);
    }
});