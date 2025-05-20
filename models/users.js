const mongoose = require('mongoose');

const xSchema = mongoose.Schema({

});

const x = mongoose.model('x', xSchema);

module.exports = x;