const mongoose = require('mongoose')

const Schema = mongoose.Schema

const configsSchema = new Schema({
    profileSupport: String,
    agencySupport: String,
    reportSupport: String,
})

const ConfigsModel = mongoose.model('configs', configsSchema)

module.exports = {
    ConfigsModel: ConfigsModel 
}