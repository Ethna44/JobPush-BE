const mongoose = require('mongoose');

// //pensez pour plus tard à rajouter la vérification de type , exemple  firstname: {
//     type: String,
//     required: true,
// }//


const offersSchema = mongoose.Schema({
  title: String,
  compagny: String,
  logoLink: String,
  grade: Number,
 typeContract :String, 
  publicationDate: Date,
  streetNumber: Number,
  streetName: String,
  city : String,
  zipCode : Number,
  source : String,
  offerLink : String,
  description : String,

  
    
  }); 


const Offer = mongoose.model('offers', offersSchema);

module.exports = Offer;
