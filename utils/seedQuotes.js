const { Quote } = require('../models/models');
const initialQuotes = require('./initialQuotes');

async function seedQuotes() {
    try {
        console.log('Початок заповнення бази даних цитатами...');
        
        // Перевіряємо, чи є вже цитати в базі
        const existingQuotes = await Quote.count();
        
        if (existingQuotes > 0) {
            console.log(`В базі вже є ${existingQuotes} цитат. Пропускаємо заповнення.`);
            return;
        }
        
        // Додаємо цитати
        await Quote.bulkCreate(initialQuotes);
        
        console.log(`Успішно додано ${initialQuotes.length} цитат до бази даних.`);
        
    } catch (error) {
        console.error('Помилка при заповненні цитат:', error);
    }
}

// Якщо файл запущений напряму
if (require.main === module) {
    seedQuotes().then(() => {
        console.log('Заповнення завершено.');
        process.exit(0);
    }).catch((error) => {
        console.error('Помилка:', error);
        process.exit(1);
    });
}

module.exports = seedQuotes; 