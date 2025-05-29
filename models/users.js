const mongoose = require('mongoose');

// //pensez pour plus tard à rajouter la vérification de type , exemple  firstname: {
//     type: String,
//     required: true,
// }//


const addressSchema = mongoose.Schema({
 streetNumber: Number,
 streetName: String,
 city: String,
 zipCode : String,
});

const preferencesSchema = mongoose.Schema({
 jobTitle: String,
 sector: String,
  contractType :String, 
  remote: String, 
  city : String,
  region :String,
//   createdAt: { type: Date, default: Date.now },
//   updatedAt : Date,
}, { timestamps: true });


const userSchema = mongoose.Schema({
  email: String,
  password: String,
  token: String,
  name: String,
  firstName: String,
  phoneNumber: Number,
  address: [addressSchema], //Tableau de sous Documents pour permettre à l'utilisateur de pouvoir enregistrer plusieurs adresses.
  preferences: [preferencesSchema],
  alerts: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'offers' }], //Tab d'obj ID car possibilité d'avoir plusieurs offres en favori
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'applications' }],
 }, { timestamps: true }); // // Active la création automatique des champs 'createdAt' et 'updatedAt' pour chaque document

  // createdAt: { type: Date, default: Date.now }, //pour générer automatiquement la Date dans la DB en passant par l'automatisation de  la fonctionnalité mongoose 
 // updatedAt: Date,



const User = mongoose.model('users', userSchema);

module.exports = User;
