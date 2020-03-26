const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create Schema

const ShareMraketData = new Schema({
    data: {type: String}
	
});
//module.exports = mongoose.model("ShareMraketData", ShareMraketData);
const ShareMraket = (module.exports = mongoose.model("ShareMraketData", ShareMraketData));