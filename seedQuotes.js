require('dotenv').config();
const { Quote } = require('./models/models');

const initialQuotes = [
    {
      text: "Здоров'я — не все, але без здоров'я все — ніщо.",
      author: "Артур Шопенгауер",
      category: "health"
    },
    {
      text: "Здоров'я — це найбільший скарб.",
      author: "Гіппократ",
      category: "health"
    },
    {
      text: "Турбота про себе — не егоїзм, а запорука здоров’я.",
      author: "Антуан де Сент-Екзюпері",
      category: "health"
    },
    {
      text: "Хто має здоров’я, той має надію; хто має надію, той має все.",
      author: "Томас Карлайл",
      category: "health"
    },
    {
      text: "Ваше тіло чує все, що говорить ваш розум.",
      author: "Наполеон Хілл",
      category: "health"
    },
    {
      text: "Найкращий час посадити дерево було 20 років тому. Другий найкращий час — зараз.",
      author: "Китайська прислів’я",
      category: "motivation"
    },
    {
      text: "Кожен день — це нова можливість стати кращим.",
      author: "Невідомий",
      category: "motivation"
    },
    {
      text: "Не чекай. Ніколи не буде «ідеального» моменту.",
      author: "Наполеон Хілл",
      category: "motivation"
    },
    {
      text: "Єдиний крок до перемоги — діяти вже сьогодні.",
      author: "Зіг Зіглар",
      category: "motivation"
    },
    {
      text: "Дрібні кроки ведуть до важливих результатів.",
      author: "Роберт Коллієр",
      category: "motivation"
    },
    {
      text: "Успіх — це не кінцева точка, а подорож.",
      author: "Роберт Шуллер",
      category: "success"
    },
    {
      text: "Успіх приходить до тих, хто не боїться невдач.",
      author: "Наполеон Хілл",
      category: "success"
    },
    {
      text: "Секрет успіху — почати.",
      author: "Марк Твен",
      category: "success"
    },
    {
      text: "Успіх — це вміння втратити менше, ніж інші.",
      author: "Френк Сінатра",
      category: "success"
    },
    {
      text: "Життя не вимірюється кількістю вдихів, а моментами, що захоплюють дух.",
      author: "Мая Енджелоу",
      category: "success"
    },
    {
      text: "Єдиний спосіб робити великі справи — любити те, що ти робиш.",
      author: "Стів Джобс",
      category: "inspiration"
    },
    {
      text: "Не бійся змін. Ти можеш втратити щось хороше, але знайдеш щось краще.",
      author: "Майя Енджелоу",
      category: "inspiration"
    },
    {
      text: "Великі мрії починаються з маленького кроку.",
      author: "Нельсон Мандела",
      category: "inspiration"
    },
    {
      text: "Хто не ризикує — не жевріє.",
      author: "Публій Сір",
      category: "inspiration"
    },
    {
      text: "Віра у себе — початок кожного досягнення.",
      author: "Наполеон Хілл",
      category: "inspiration"
    },
    {
      text: "Життя — це подорож, а не пункт призначення.",
      author: "Ральф Вальдо Емерсон",
      category: "wisdom"
    },
    {
      text: "Життя — це 10% того, що з тобою трапляється, і 90% того, як ти на це реагуєш.",
      author: "Чарльз Р. Свіндолл",
      category: "wisdom"
    },
    {
      text: "Немає короткого шляху до місця, куди варто йти.",
      author: "Беверлі Сілз",
      category: "wisdom"
    },
    {
      text: "Хто володіє собою — володіє світом.",
      author: "Лао-цзи",
      category: "wisdom"
    },
    {
      text: "Мудрий той, хто знає, коли йти вперед, а коли зупинитися.",
      author: "Китайська прислів’я",
      category: "wisdom"
    }
  ];

async function seedQuotes() {
    try {
        console.log('Початок заповнення бази даних цитатами...');
        
        const existingQuotes = await Quote.count();
        
        if (existingQuotes > 0) {
            console.log(`В базі вже є ${existingQuotes} цитат. Пропускаємо заповнення.`);
            return;
        }
        
        await Quote.bulkCreate(initialQuotes);
        
        console.log(`Успішно додано ${initialQuotes.length} цитат до бази даних.`);
        
    } catch (error) {
        console.error('Помилка при заповненні цитат:', error);
    }
}

seedQuotes().then(() => {
    console.log('Заповнення завершено.');
    process.exit(0);
}).catch((error) => {
    console.error('Помилка:', error);
    process.exit(1);
}); 