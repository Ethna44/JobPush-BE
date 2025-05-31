# JobPush

JobPush est une application mobile qui facilite la recherche d’emploi, la gestion de candidatures et la découverte d’astuces pour optimiser son parcours professionnel.

---

## 📦 Dépôt Backend (JobPush-BE)

### 🔧 Installation
bash
- git clone https://github.com/<votre-org>/JobPush-BE.git
- cd JobPush-BE
- npm install


### ⚙️ Configuration
Créez un fichier .env à la racine du projet avec :

- CONNECTION_STRING="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/Jobpush"
- MAIL_USER='votre.email@gmail.com'
- MAIL_PASS='votre_mot_de_passe_application_gmail'


> **Astuce** : Pour Gmail, créez un [mot de passe d’application](https://myaccount.google.com/apppasswords) si l’authentification à deux facteurs est activée.

### ✨ Fonctionnalités principales
- Navigation ongletée : Accueil, Offres, Candidatures, Astuces, Compte
- Authentification, inscription, gestion du profil
- Recherche et filtrage d’offres
- Gestion des candidatures et favoris
- Articles & astuces par tags
- Notifications personnalisées

### 🧰 Stack technique 
- Node.js + Express
- MongoDB
- Mongoose
- Nodemailer (emails)
- Cron (alertes auto)
- Dotenv (env vars)

---
