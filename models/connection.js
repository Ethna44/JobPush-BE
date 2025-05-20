const mongoose = require('mongoose');

const connectionString = 'mongodb+srv://Reazay:q0gjUs0GfVsUycyJ@cluster0.cl18hjd.mongodb.net/weatherapp';

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));