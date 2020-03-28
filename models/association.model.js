const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let AssociationSchema = new Schema({
    name: {type: String, required: true},
    resources: {type: [String], required: true},
    city: {type: String, required: true},
    usesSpreadsheet: {type: Boolean, required: true},
    spreadsheetID: {type: String, required: false},
});

module.exports = mongoose.model('Association', AssociationSchema);