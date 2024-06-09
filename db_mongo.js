const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://admin:admin_mes@cluster0.3iznjgs.mongodb.net/game-so-xo', {
            auth: {
                username: 'admin',
                password: 'admin_mes',
            },
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.info(`=> connect database success`);
    } catch (error) {
        console.info(`=> connect DB failure`);
        console.error(error);
    }
}

module.exports = { connect };