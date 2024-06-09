const mongoose = require('mongoose')

const Schema = mongoose.Schema

const spendingUserSchema = new Schema({
    userId: String,
    bet: String,
    winOrLoss: String,
})

const SpendingUserModel = mongoose.model('spendingUser', spendingUserSchema)

module.exports = {
    SpendingUserModel: SpendingUserModel 
}