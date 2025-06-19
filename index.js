require('dotenv').config();
const app = require('./app');
const sequelize = require('./db');
const { Quote } = require('./models/models');
const path = require('path');

const port = process.env.PORT || 4500;

const checkAndSeedQuotes = async () => {
    const count = await Quote.count();
    if (count === 0) {
        console.log('Цитати відсутні, викликаю seedQuotes.js...');
        require(path.join(__dirname, 'seedQuotes.js'));
    } else {
        console.log(`В базі вже є ${count} цитат.`);
    }
};

const start = async () => {
    try { 
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // await sequelize.sync({ force: true }) // for clear DB

        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');
        await checkAndSeedQuotes();

        app.listen(port, () => console.log(`Server started on port: ${port}`))
    } catch (e) {
        console.error('Unable to start the server:', e);
        process.exit(1);
    }
}

start()
