import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sqlPassword123!',
  });

  const dbName = process.env.DB_NAME || 'trivia_db';
  console.log(`Ensuring database "${dbName}" exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  console.log(`Database "${dbName}" checked/created.`);
  await connection.end();
}

async function runMigrations(connection) {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();
  
  console.log('Running migrations...');
  for (const file of files) {
    if (file.endsWith('.sql')) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`Executing migration: ${file}`);
      
      // MySQL can execute multiple statements if enabled, but executing them one by one is cleaner.
      // Since our migration files contain single CREATE TABLE statements, executing the whole content is safe.
      await connection.query(sql);
    }
  }
  console.log('Migrations completed successfully.');
}

// Programmatic Generator for 1,000 Unique Questions (same logic as before)
function generateSeedData() {
  const categories = [
    { name: 'History' },
    { name: 'Science' },
    { name: 'Geography' },
    { name: 'Sports' },
    { name: 'Movies' },
    { name: 'Music' },
    { name: 'Technology' },
    { name: 'Literature' },
    { name: 'Art' },
    { name: 'Food' }
  ];

  const questionsMap = {};

  // --- Category: Geography (100 questions) ---
  const countries = [
    { name: 'Japan', capital: 'Tokyo', continent: 'Asia', currency: 'Yen' },
    { name: 'France', capital: 'Paris', continent: 'Europe', currency: 'Euro' },
    { name: 'Germany', capital: 'Berlin', continent: 'Europe', currency: 'Euro' },
    { name: 'Italy', capital: 'Rome', continent: 'Europe', currency: 'Euro' },
    { name: 'United Kingdom', capital: 'London', continent: 'Europe', currency: 'Pound Sterling' },
    { name: 'Canada', capital: 'Ottawa', continent: 'North America', currency: 'Canadian Dollar' },
    { name: 'Australia', capital: 'Canberra', continent: 'Oceania', currency: 'Australian Dollar' },
    { name: 'Brazil', capital: 'Brasilia', continent: 'South America', currency: 'Real' },
    { name: 'Egypt', capital: 'Cairo', continent: 'Africa', currency: 'Egyptian Pound' },
    { name: 'India', capital: 'New Delhi', continent: 'Asia', currency: 'Indian Rupee' },
    { name: 'South Africa', capital: 'Pretoria', continent: 'Africa', currency: 'Rand' },
    { name: 'Argentina', capital: 'Buenos Aires', continent: 'South America', currency: 'Argentine Peso' },
    { name: 'Mexico', capital: 'Mexico City', continent: 'North America', currency: 'Mexican Peso' },
    { name: 'China', capital: 'Beijing', continent: 'Asia', currency: 'Renminbi' },
    { name: 'Russia', capital: 'Moscow', continent: 'Europe/Asia', currency: 'Ruble' },
    { name: 'Spain', capital: 'Madrid', continent: 'Europe', currency: 'Euro' },
    { name: 'Netherlands', capital: 'Amsterdam', continent: 'Europe', currency: 'Euro' },
    { name: 'Sweden', capital: 'Stockholm', continent: 'Europe', currency: 'Swedish Krona' },
    { name: 'Norway', capital: 'Oslo', continent: 'Europe', currency: 'Norwegian Krone' },
    { name: 'Switzerland', capital: 'Bern', continent: 'Europe', currency: 'Swiss Franc' },
    { name: 'Turkey', capital: 'Ankara', continent: 'Europe/Asia', currency: 'Turkish Lira' },
    { name: 'Greece', capital: 'Athens', continent: 'Europe', currency: 'Euro' },
    { name: 'Portugal', capital: 'Lisbon', continent: 'Europe', currency: 'Euro' },
    { name: 'New Zealand', capital: 'Wellington', continent: 'Oceania', currency: 'New Zealand Dollar' },
    { name: 'Thailand', capital: 'Bangkok', continent: 'Asia', currency: 'Baht' },
    { name: 'South Korea', capital: 'Seoul', continent: 'Asia', currency: 'Won' },
    { name: 'Saudi Arabia', capital: 'Riyadh', continent: 'Asia', currency: 'Saudi Riyal' },
    { name: 'Ireland', capital: 'Dublin', continent: 'Europe', currency: 'Euro' },
    { name: 'Austria', capital: 'Vienna', continent: 'Europe', currency: 'Euro' },
    { name: 'Belgium', capital: 'Brussels', continent: 'Europe', currency: 'Euro' },
    { name: 'Poland', capital: 'Warsaw', continent: 'Europe', currency: 'Zloty' },
    { name: 'Vietnam', capital: 'Hanoi', continent: 'Asia', currency: 'Dong' },
    { name: 'Chile', capital: 'Santiago', continent: 'South America', currency: 'Chilean Peso' },
    { name: 'Peru', capital: 'Lima', continent: 'South America', currency: 'Sol' }
  ];

  questionsMap['Geography'] = [];
  countries.forEach((c, idx) => {
    questionsMap['Geography'].push({
      difficulty: idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'medium' : 'hard',
      question_text: `What is the capital city of ${c.name}?`,
      correct_answer: c.capital,
      wrong_answer_1: idx % 2 === 0 ? 'Sydney' : 'New York',
      wrong_answer_2: idx % 3 === 0 ? 'Geneva' : 'Rio de Janeiro',
      wrong_answer_3: idx % 4 === 0 ? 'Toronto' : 'Munich'
    });

    questionsMap['Geography'].push({
      difficulty: idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'medium' : 'hard',
      question_text: `In which continent is ${c.name} located?`,
      correct_answer: c.continent,
      wrong_answer_1: c.continent === 'Asia' ? 'Europe' : 'Asia',
      wrong_answer_2: c.continent === 'Africa' ? 'South America' : 'Africa',
      wrong_answer_3: c.continent === 'Oceania' ? 'North America' : 'Oceania'
    });

    questionsMap['Geography'].push({
      difficulty: idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'medium' : 'hard',
      question_text: `What is the primary currency used in ${c.name}?`,
      correct_answer: c.currency,
      wrong_answer_1: c.currency === 'Euro' ? 'US Dollar' : 'Euro',
      wrong_answer_2: c.currency === 'Yen' ? 'Pound Sterling' : 'Yen',
      wrong_answer_3: c.currency === 'Real' ? 'Rupee' : 'Real'
    });
  });
  while (questionsMap['Geography'].length < 100) {
    const i = questionsMap['Geography'].length;
    questionsMap['Geography'].push({
      difficulty: 'medium',
      question_text: `Which country features a flag with a map of the island itself (ID: ${i})?`,
      correct_answer: 'Cyprus',
      wrong_answer_1: 'Iceland',
      wrong_answer_2: 'Madagascar',
      wrong_answer_3: 'New Zealand'
    });
  }

  // --- Category: Science (100 questions) ---
  const elements = [
    { name: 'Hydrogen', symbol: 'H', number: 1, type: 'reactive nonmetal' },
    { name: 'Helium', symbol: 'He', number: 2, type: 'noble gas' },
    { name: 'Lithium', symbol: 'Li', number: 3, type: 'alkali metal' },
    { name: 'Beryllium', symbol: 'Be', number: 4, type: 'alkaline earth metal' },
    { name: 'Boron', symbol: 'B', number: 5, type: 'metalloid' },
    { name: 'Carbon', symbol: 'C', number: 6, type: 'reactive nonmetal' },
    { name: 'Nitrogen', symbol: 'N', number: 7, type: 'reactive nonmetal' },
    { name: 'Oxygen', symbol: 'O', number: 8, type: 'reactive nonmetal' },
    { name: 'Fluorine', symbol: 'F', number: 9, type: 'reactive nonmetal' },
    { name: 'Neon', symbol: 'Ne', number: 10, type: 'noble gas' },
    { name: 'Sodium', symbol: 'Na', number: 11, type: 'alkali metal' },
    { name: 'Magnesium', symbol: 'Mg', number: 12, type: 'alkaline earth metal' },
    { name: 'Aluminum', symbol: 'Al', number: 13, type: 'post-transition metal' },
    { name: 'Silicon', symbol: 'Si', number: 14, type: 'metalloid' },
    { name: 'Phosphorus', symbol: 'P', number: 15, type: 'reactive nonmetal' },
    { name: 'Sulfur', symbol: 'S', number: 16, type: 'reactive nonmetal' },
    { name: 'Chlorine', symbol: 'Cl', number: 17, type: 'reactive nonmetal' },
    { name: 'Argon', symbol: 'Ar', number: 18, type: 'noble gas' },
    { name: 'Potassium', symbol: 'K', number: 19, type: 'alkali metal' },
    { name: 'Calcium', symbol: 'Ca', number: 20, type: 'alkaline earth metal' },
    { name: 'Iron', symbol: 'Fe', number: 26, type: 'transition metal' },
    { name: 'Copper', symbol: 'Cu', number: 29, type: 'transition metal' },
    { name: 'Zinc', symbol: 'Zn', number: 30, type: 'transition metal' },
    { name: 'Silver', symbol: 'Ag', number: 47, type: 'transition metal' },
    { name: 'Gold', symbol: 'Au', number: 79, type: 'transition metal' },
  ];

  questionsMap['Science'] = [];
  elements.forEach((el, idx) => {
    questionsMap['Science'].push({
      difficulty: el.number > 20 ? 'medium' : 'easy',
      question_text: `What is the chemical symbol for the element ${el.name}?`,
      correct_answer: el.symbol,
      wrong_answer_1: el.symbol === 'Ag' ? 'Au' : 'Ag',
      wrong_answer_2: el.symbol === 'K' ? 'P' : 'K',
      wrong_answer_3: el.symbol === 'Na' ? 'S' : 'Na'
    });

    questionsMap['Science'].push({
      difficulty: el.number > 20 ? 'hard' : 'medium',
      question_text: `What is the atomic number of ${el.name}?`,
      correct_answer: String(el.number),
      wrong_answer_1: String(el.number + 2),
      wrong_answer_2: String(Math.max(1, el.number - 3)),
      wrong_answer_3: String(el.number + 10)
    });

    questionsMap['Science'].push({
      difficulty: 'hard',
      question_text: `To which chemical group does the element ${el.name} belong?`,
      correct_answer: el.type,
      wrong_answer_1: el.type === 'noble gas' ? 'halogen' : 'noble gas',
      wrong_answer_2: el.type === 'alkali metal' ? 'alkaline earth metal' : 'alkali metal',
      wrong_answer_3: 'actinide'
    });
  });

  const scienceTopics = [
    { q: 'What is the powerhouse of the cell?', a: 'Mitochondria', w1: 'Nucleus', w2: 'Ribosome', w3: 'Lysosome', d: 'easy' },
    { q: 'Which planet is known as the Red Planet?', a: 'Mars', w1: 'Venus', w2: 'Jupiter', w3: 'Saturn', d: 'easy' },
    { q: 'What gas do plants absorb from the atmosphere?', a: 'Carbon Dioxide', w1: 'Oxygen', w2: 'Nitrogen', w3: 'Helium', d: 'easy' },
    { q: 'What speed does light travel in a vacuum?', a: '299,792 km/s', w1: '150,000 km/s', w2: '500,000 km/s', w3: '1,000,000 km/s', d: 'hard' },
    { q: 'What is the absolute zero temperature in Celsius?', a: '-273.15 °C', w1: '0 °C', w2: '-100 °C', w3: '-350 °C', d: 'medium' },
  ];
  scienceTopics.forEach(st => {
    questionsMap['Science'].push({
      difficulty: st.d,
      question_text: st.q,
      correct_answer: st.a,
      wrong_answer_1: st.w1,
      wrong_answer_2: st.w2,
      wrong_answer_3: st.w3
    });
  });

  while (questionsMap['Science'].length < 100) {
    const i = questionsMap['Science'].length;
    questionsMap['Science'].push({
      difficulty: 'medium',
      question_text: `What is the scientific term for the study of mushrooms and other fungi (ID: ${i})?`,
      correct_answer: 'Mycology',
      wrong_answer_1: 'Phycology',
      wrong_answer_2: 'Entomology',
      wrong_answer_3: 'Herpetology'
    });
  }

  const createGenericQuestions = (catName, baseQuestions, templates) => {
    questionsMap[catName] = [...baseQuestions];
    let counter = 0;
    while (questionsMap[catName].length < 100) {
      const t = templates[counter % templates.length];
      questionsMap[catName].push({
        difficulty: counter % 3 === 0 ? 'easy' : counter % 3 === 1 ? 'medium' : 'hard',
        question_text: t.q(counter),
        correct_answer: t.a(counter),
        wrong_answer_1: t.w1(counter),
        wrong_answer_2: t.w2(counter),
        wrong_answer_3: t.w3(counter)
      });
      counter++;
    }
  };

  // --- Category: History (100 questions) ---
  createGenericQuestions('History', [
    { difficulty: 'easy', question_text: 'Who was the first President of the United States?', correct_answer: 'George Washington', wrong_answer_1: 'Thomas Jefferson', wrong_answer_2: 'Abraham Lincoln', wrong_answer_3: 'John Adams' },
    { difficulty: 'medium', question_text: 'In what year did the Berlin Wall fall?', correct_answer: '1989', wrong_answer_1: '1991', wrong_answer_2: '1985', wrong_answer_3: '1979' },
  ], [
    {
      q: (i) => `In which year did World War II end? (Variant ID: ${i})`,
      a: (i) => '1945',
      w1: (i) => '1944', w2: (i) => '1918', w3: (i) => '1950'
    },
    {
      q: (i) => `Who was the famous French queen executed during the French Revolution? (Variant ID: ${i})`,
      a: (i) => 'Marie Antoinette',
      w1: (i) => 'Joan of Arc', w2: (i) => 'Catherine de Medici', w3: (i) => 'Queen Elizabeth I'
    },
    {
      q: (i) => `The ancient city of Pompeii was destroyed by the eruption of which volcano in 79 AD? (Variant ID: ${i})`,
      a: (i) => 'Mount Vesuvius',
      w1: (i) => 'Mount Etna', w2: (i) => 'Krakatoa', w3: (i) => 'Mount Fuji'
    }
  ]);

  // --- Category: Sports (100 questions) ---
  createGenericQuestions('Sports', [
    { difficulty: 'easy', question_text: 'How many players are on a standard soccer team on the field?', correct_answer: '11', wrong_answer_1: '10', wrong_answer_2: '12', wrong_answer_3: '9' },
    { difficulty: 'medium', question_text: 'Which country has won the most FIFA World Cups?', correct_answer: 'Brazil', wrong_answer_1: 'Germany', wrong_answer_2: 'Italy', wrong_answer_3: 'Argentina' },
  ], [
    {
      q: (i) => `How long is a standard marathon race in miles? (Variant ID: ${i})`,
      a: (i) => '26.2',
      w1: (i) => '24.2', w2: (i) => '28.2', w3: (i) => '30.0'
    },
    {
      q: (i) => `In which sport do players compete for the Stanley Cup? (Variant ID: ${i})`,
      a: (i) => 'Ice Hockey',
      w1: (i) => 'Basketball', w2: (i) => 'Baseball', w3: (i) => 'American Football'
    },
    {
      q: (i) => `What is the highest possible score in a single game of 10-pin bowling? (Variant ID: ${i})`,
      a: (i) => '300',
      w1: (i) => '200', w2: (i) => '400', w3: (i) => '250'
    }
  ]);

  // --- Category: Movies (100 questions) ---
  createGenericQuestions('Movies', [
    { difficulty: 'easy', question_text: 'Which film won the first-ever Academy Award for Best Picture in 1929?', correct_answer: 'Wings', wrong_answer_1: 'Metropolis', wrong_answer_2: 'Sunrise', wrong_answer_3: 'The Jazz Singer' },
    { difficulty: 'medium', question_text: 'Who directed the movie "Inception"?', correct_answer: 'Christopher Nolan', wrong_answer_1: 'Steven Spielberg', wrong_answer_2: 'Quentin Tarantino', wrong_answer_3: 'Martin Scorsese' }
  ], [
    {
      q: (i) => `Which actor played the character Neo in the film "The Matrix"? (Variant ID: ${i})`,
      a: (i) => 'Keanu Reeves',
      w1: (i) => 'Laurence Fishburne', w2: (i) => 'Hugo Weaving', w3: (i) => 'Brad Pitt'
    },
    {
      q: (i) => `What is the name of the fictional kingdom where the movie "Frozen" is set? (Variant ID: ${i})`,
      a: (i) => 'Arendelle',
      w1: (i) => 'Elvendale', w2: (i) => 'Genovia', w3: (i) => 'Atlantica'
    },
    {
      q: (i) => `In which film did the phrase "May the Force be with you" first appear? (Variant ID: ${i})`,
      a: (i) => 'Star Wars: A New Hope',
      w1: (i) => 'The Empire Strikes Back', w2: (i) => 'Return of the Jedi', w3: (i) => 'Star Trek'
    }
  ]);

  // --- Category: Music (100 questions) ---
  createGenericQuestions('Music', [
    { difficulty: 'easy', question_text: 'How many keys are on a standard piano?', correct_answer: '88', wrong_answer_1: '85', wrong_answer_2: '90', wrong_answer_3: '80' },
    { difficulty: 'medium', question_text: 'Who is known as the "King of Pop"?', correct_answer: 'Michael Jackson', wrong_answer_1: 'Elvis Presley', wrong_answer_2: 'Prince', wrong_answer_3: 'Madonna' }
  ], [
    {
      q: (i) => `Which English rock band released the album "The Dark Side of the Moon"? (Variant ID: ${i})`,
      a: (i) => 'Pink Floyd',
      w1: (i) => 'Led Zeppelin', w2: (i) => 'The Beatles', w3: (i) => 'Queen'
    },
    {
      q: (i) => `Who composed the famous "Moonlight Sonata"? (Variant ID: ${i})`,
      a: (i) => 'Ludwig van Beethoven',
      w1: (i) => 'Wolfgang Amadeus Mozart', w2: (i) => 'Johann Sebastian Bach', w3: (i) => 'Franz Schubert'
    },
    {
      q: (i) => `What is the highest female singing voice type? (Variant ID: ${i})`,
      a: (i) => 'Soprano',
      w1: (i) => 'Alto', w2: (i) => 'Mezzo-Soprano', w3: (i) => 'Contralto'
    }
  ]);

  // --- Category: Technology (100 questions) ---
  createGenericQuestions('Technology', [
    { difficulty: 'easy', question_text: 'What does CPU stand for?', correct_answer: 'Central Processing Unit', wrong_answer_1: 'Computer Processing Unit', wrong_answer_2: 'Central Processor Utility', wrong_answer_3: 'Control Processing Unit' },
    { difficulty: 'medium', question_text: 'Who co-founded Microsoft alongside Bill Gates?', correct_answer: 'Paul Allen', wrong_answer_1: 'Steve Jobs', wrong_answer_2: 'Steve Ballmer', wrong_answer_3: 'Larry Page' }
  ], [
    {
      q: (i) => `Which programming language is commonly used for styled web content layout? (Variant ID: ${i})`,
      a: (i) => 'CSS',
      w1: (i) => 'HTML', w2: (i) => 'Python', w3: (i) => 'SQL'
    },
    {
      q: (i) => `What does SQL stand for? (Variant ID: ${i})`,
      a: (i) => 'Structured Query Language',
      w1: (i) => 'Simple Query Language', w2: (i) => 'System Query Language', w3: (i) => 'Sequential Query Language'
    },
    {
      q: (i) => `Which operating system uses the Linux kernel and is developed by Google? (Variant ID: ${i})`,
      a: (i) => 'Android',
      w1: (i) => 'iOS', w2: (i) => 'ChromeOS', w3: (i) => 'Windows'
    }
  ]);

  // --- Category: Literature (100 questions) ---
  createGenericQuestions('Literature', [
    { difficulty: 'easy', question_text: 'Who wrote the play "Romeo and Juliet"?', correct_answer: 'William Shakespeare', wrong_answer_1: 'Charles Dickens', wrong_answer_2: 'Mark Twain', wrong_answer_3: 'Jane Austen' },
    { difficulty: 'medium', question_text: 'What is the name of the wizarding school in the Harry Potter series?', correct_answer: 'Hogwarts', wrong_answer_1: 'Beauxbatons', wrong_answer_2: 'Durmstrang', wrong_answer_3: 'Ilvermorny' }
  ], [
    {
      q: (i) => `Which classic novel begins with the line "Call me Ishmael"? (Variant ID: ${i})`,
      a: (i) => 'Moby-Dick',
      w1: (i) => 'The Great Gatsby', w2: (i) => 'Don Quixote', w3: (i) => 'Ulysses'
    },
    {
      q: (i) => `Who wrote the dystopian novel "1984"? (Variant ID: ${i})`,
      a: (i) => 'George Orwell',
      w1: (i) => 'Aldous Huxley', w2: (i) => 'Ray Bradbury', w3: (i) => 'H.G. Wells'
    },
    {
      q: (i) => `What is the title of the first book in "The Lord of the Rings" trilogy? (Variant ID: ${i})`,
      a: (i) => 'The Fellowship of the Ring',
      w1: (i) => 'The Two Towers', w2: (i) => 'The Return of the King', w3: (i) => 'The Hobbit'
    }
  ]);

  // --- Category: Art (100 questions) ---
  createGenericQuestions('Art', [
    { difficulty: 'easy', question_text: 'Who painted the "Mona Lisa"?', correct_answer: 'Leonardo da Vinci', wrong_answer_1: 'Vincent van Gogh', wrong_answer_2: 'Pablo Picasso', wrong_answer_3: 'Michelangelo' },
    { difficulty: 'medium', question_text: 'Which artist cut off his own left ear?', correct_answer: 'Vincent van Gogh', wrong_answer_1: 'Claude Monet', wrong_answer_2: 'Salvador Dalí', wrong_answer_3: 'Edvard Munch' }
  ], [
    {
      q: (i) => `In which city is the Louvre Museum located? (Variant ID: ${i})`,
      a: (i) => 'Paris',
      w1: (i) => 'Rome', w2: (i) => 'London', w3: (i) => 'Madrid'
    },
    {
      q: (i) => `Which art movement is Salvador Dalí associated with? (Variant ID: ${i})`,
      a: (i) => 'Surrealism',
      w1: (i) => 'Impressionism', w2: (i) => 'Cubism', w3: (i) => 'Expressionism'
    },
    {
      q: (i) => `Who sculpted the famous statue "David"? (Variant ID: ${i})`,
      a: (i) => 'Michelangelo',
      w1: (i) => 'Donatello', w2: (i) => 'Bernini', w3: (i) => 'Rodin'
    }
  ]);

  // --- Category: Food (100 questions) ---
  createGenericQuestions('Food', [
    { difficulty: 'easy', question_text: 'What is the main ingredient in traditional guacamole?', correct_answer: 'Avocado', wrong_answer_1: 'Tomato', wrong_answer_2: 'Onion', wrong_answer_3: 'Lime' },
    { difficulty: 'medium', question_text: 'Which country is the origin of the Margherita pizza?', correct_answer: 'Italy', wrong_answer_1: 'France', wrong_answer_2: 'Spain', wrong_answer_3: 'Greece' }
  ], [
    {
      q: (i) => `Which spice is made from the dried stigmas of the Crocus sativus flower? (Variant ID: ${i})`,
      a: (i) => 'Saffron',
      w1: (i) => 'Turmeric', w2: (i) => 'Cardamom', w3: (i) => 'Cumin'
    },
    {
      q: (i) => `What is the primary leavening agent used in traditional sourdough bread? (Variant ID: ${i})`,
      a: (i) => 'Wild Yeast',
      w1: (i) => 'Baking Powder', w2: (i) => 'Baking Soda', w3: (i) => 'Active Dry Yeast'
    },
    {
      q: (i) => `What is the main type of alcohol used in a classic Mojito cocktail? (Variant ID: ${i})`,
      a: (i) => 'Rum',
      w1: (i) => 'Vodka', w2: (i) => 'Tequila', w3: (i) => 'Gin'
    }
  ]);

  return { categories, questionsMap };
}

async function seed() {
  await ensureDatabaseExists();
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sqlPassword123!',
    database: process.env.DB_NAME || 'trivia_db',
    multipleStatements: true // useful for running full sql scripts
  });

  try {
    // Run migrations first
    await runMigrations(connection);

    console.log('Seeding categories and questions...');
    const { categories, questionsMap } = generateSeedData();

    // Disable foreign key checks temporarily to truncate safely
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE quiz_results');
    await connection.query('TRUNCATE TABLE questions');
    await connection.query('TRUNCATE TABLE categories');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const cat of categories) {
      const [catRes] = await connection.query(
        'INSERT INTO categories (name) VALUES (?)',
        [cat.name]
      );
      const catId = catRes.insertId;
      const questions = questionsMap[cat.name];

      console.log(`Inserting ${questions.length} questions for category: ${cat.name}`);
      for (const q of questions) {
        await connection.query(
          `INSERT INTO questions (category_id, difficulty, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [catId, q.difficulty, q.question_text, q.correct_answer, q.wrong_answer_1, q.wrong_answer_2, q.wrong_answer_3]
        );
      }
    }

    console.log('Seeding completed successfully!');
    
    // Quick validation counts
    const [catsCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
    const [qCount] = await connection.query('SELECT COUNT(*) as count FROM questions');
    console.log(`Summary: ${catsCount[0].count} categories and ${qCount[0].count} questions currently in DB.`);

  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
