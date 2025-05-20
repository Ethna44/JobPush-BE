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
 contractType: String,
  remote: String, 
  city : String,
  region :String,
  createdAt: Date,
  updatedAt : Date

});



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
  createdAt: Date,
  updatedAt: Date,

});

const User = mongoose.model('users', userSchema);

module.exports = User;
