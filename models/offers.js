const mongoose = require('mongoose');

// //pensez pour plus tard à rajouter la vérification de type , exemple  firstname: {
//     type: String,
//     required: true,
// }//


const offersSchema = mongoose.Schema({
  title: String,
  compagny: String,
  logoLink: String,
  grade: String,
  publicationDate: Date,
  streetNumber: Number,
  streetName: String,
  city : String,
  zipCode : Number,
  source : String,
  offerLink : String,
  description : String,

  
    
  }); // // Active la création automatique des champs 'createdAt' et 'updatedAt' pour chaque document

  // createdAt: { type: Date, default: Date.now }, //pour générer automatiquement la Date dans la DB en passant par l'automatisation de  la fonctionnalité mongoose 
 // updatedAt: Date,



const Offer = mongoose.model('offers', offersSchema);

module.exports = Offer;
