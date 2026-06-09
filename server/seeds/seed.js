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
      await connection.query(sql);
    }
  }
  console.log('Migrations completed successfully.');
}

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

  // --- Category: Geography (102 unique country questions + extra) ---
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

  // --- Category: Science (75 elements questions + 25 unique questions) ---
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

  const extraScience = [
    { difficulty: 'easy', question_text: 'What is the powerhouse of the cell?', correct_answer: 'Mitochondria', wrong_answer_1: 'Nucleus', wrong_answer_2: 'Ribosome', wrong_answer_3: 'Lysosome' },
    { difficulty: 'easy', question_text: 'Which planet is known as the Red Planet?', correct_answer: 'Mars', wrong_answer_1: 'Venus', wrong_answer_2: 'Jupiter', wrong_answer_3: 'Saturn' },
    { difficulty: 'easy', question_text: 'What gas do plants absorb from the atmosphere?', correct_answer: 'Carbon Dioxide', wrong_answer_1: 'Oxygen', wrong_answer_2: 'Nitrogen', wrong_answer_3: 'Helium' },
    { difficulty: 'hard', question_text: 'What speed does light travel in a vacuum?', correct_answer: '299,792 km/s', wrong_answer_1: '150,000 km/s', wrong_answer_2: '500,000 km/s', wrong_answer_3: '1,000,000 km/s' },
    { difficulty: 'medium', question_text: 'What is the absolute zero temperature in Celsius?', correct_answer: '-273.15 °C', wrong_answer_1: '0 °C', wrong_answer_2: '-100 °C', wrong_answer_3: '-350 °C' },
    { difficulty: 'medium', question_text: 'What is the scientific term for the study of mushrooms and other fungi?', correct_answer: 'Mycology', wrong_answer_1: 'Phycology', wrong_answer_2: 'Entomology', wrong_answer_3: 'Herpetology' },
    { difficulty: 'medium', question_text: 'Which planet has the most moons in our solar system?', correct_answer: 'Saturn', wrong_answer_1: 'Jupiter', wrong_answer_2: 'Uranus', wrong_answer_3: 'Neptune' },
    { difficulty: 'easy', question_text: 'Which main organ in the human body pumps blood?', correct_answer: 'Heart', wrong_answer_1: 'Lungs', wrong_answer_2: 'Brain', wrong_answer_3: 'Liver' },
    { difficulty: 'easy', question_text: 'How many bones are in the adult human body?', correct_answer: '206', wrong_answer_1: '186', wrong_answer_2: '216', wrong_answer_3: '306' },
    { difficulty: 'medium', question_text: 'Which gas is the most abundant in Earth\'s atmosphere?', correct_answer: 'Nitrogen', wrong_answer_1: 'Oxygen', wrong_answer_2: 'Carbon Dioxide', wrong_answer_3: 'Argon' },
    { difficulty: 'medium', question_text: 'What is the only mammal capable of true, sustained flight?', correct_answer: 'Bat', wrong_answer_1: 'Flying Squirrel', wrong_answer_2: 'Sugar Glider', wrong_answer_3: 'Pigeon' },
    { difficulty: 'hard', question_text: 'Which layer of Earth\'s atmosphere contains the ozone layer?', correct_answer: 'Stratosphere', wrong_answer_1: 'Troposphere', wrong_answer_2: 'Mesosphere', wrong_answer_3: 'Thermosphere' },
    { difficulty: 'easy', question_text: 'What is the chemical formula for water?', correct_answer: 'H2O', wrong_answer_1: 'CO2', wrong_answer_2: 'NaCl', wrong_answer_3: 'O2' },
    { difficulty: 'easy', question_text: 'Which instrument is used to measure atmospheric pressure?', correct_answer: 'Barometer', wrong_answer_1: 'Thermometer', wrong_answer_2: 'Anemometer', wrong_answer_3: 'Hygrometer' },
    { difficulty: 'medium', question_text: 'Who is considered the father of modern genetics for his work on pea plants?', correct_answer: 'Gregor Mendel', wrong_answer_1: 'Charles Darwin', wrong_answer_2: 'Louis Pasteur', wrong_answer_3: 'Francis Crick' },
    { difficulty: 'hard', question_text: 'What is the chemical name for common table salt?', correct_answer: 'Sodium Chloride', wrong_answer_1: 'Sodium Bicarbonate', wrong_answer_2: 'Calcium Carbonate', wrong_answer_3: 'Potassium Chloride' },
    { difficulty: 'medium', question_text: 'What process do plants use to convert sunlight into food?', correct_answer: 'Photosynthesis', wrong_answer_1: 'Respiration', wrong_answer_2: 'Transpiration', wrong_answer_3: 'Fermentation' },
    { difficulty: 'hard', question_text: 'What kind of subatomic particle has no electrical charge?', correct_answer: 'Neutron', wrong_answer_1: 'Proton', wrong_answer_2: 'Electron', wrong_answer_3: 'Quark' },
    { difficulty: 'medium', question_text: 'Which vitamin is produced when human skin is exposed to sunlight?', correct_answer: 'Vitamin D', wrong_answer_1: 'Vitamin C', wrong_answer_2: 'Vitamin A', wrong_answer_3: 'Vitamin B12' },
    { difficulty: 'easy', question_text: 'What is the primary source of energy for Earth?', correct_answer: 'The Sun', wrong_answer_1: 'Wind', wrong_answer_2: 'Geothermal energy', wrong_answer_3: 'Fossil fuels' }
  ];
  questionsMap['Science'].push(...extraScience);

  // --- Category: History (30 unique questions) ---
  questionsMap['History'] = [
    { difficulty: 'easy', question_text: 'Who was the first President of the United States?', correct_answer: 'George Washington', wrong_answer_1: 'Thomas Jefferson', wrong_answer_2: 'Abraham Lincoln', wrong_answer_3: 'John Adams' },
    { difficulty: 'medium', question_text: 'In what year did the Berlin Wall fall?', correct_answer: '1989', wrong_answer_1: '1991', wrong_answer_2: '1985', wrong_answer_3: '1979' },
    { difficulty: 'easy', question_text: 'Which ancient civilization built the Machu Picchu complex?', correct_answer: 'Inca', wrong_answer_1: 'Maya', wrong_answer_2: 'Aztec', wrong_answer_3: 'Egyptian' },
    { difficulty: 'medium', question_text: 'Who was the British Prime Minister during most of World War II?', correct_answer: 'Winston Churchill', wrong_answer_1: 'Neville Chamberlain', wrong_answer_2: 'Clement Attlee', wrong_answer_3: 'Margaret Thatcher' },
    { difficulty: 'easy', question_text: 'Which empire was ruled by Julius Caesar?', correct_answer: 'Roman Empire', wrong_answer_1: 'Greek Empire', wrong_answer_2: 'Persian Empire', wrong_answer_3: 'Ottoman Empire' },
    { difficulty: 'easy', question_text: 'What year did the Titanic sink?', correct_answer: '1912', wrong_answer_1: '1905', wrong_answer_2: '1920', wrong_answer_3: '1898' },
    { difficulty: 'hard', question_text: 'Who was the first emperor of China?', correct_answer: 'Qin Shi Huang', wrong_answer_1: 'Han Wudi', wrong_answer_2: 'Kublai Khan', wrong_answer_3: 'Tang Taizong' },
    { difficulty: 'medium', question_text: 'Which treaty ended World War I?', correct_answer: 'Treaty of Versailles', wrong_answer_1: 'Treaty of Utrecht', wrong_answer_2: 'Treaty of Ghent', wrong_answer_3: 'Treaty of Paris' },
    { difficulty: 'medium', question_text: 'Who was the famous French queen executed during the French Revolution?', correct_answer: 'Marie Antoinette', wrong_answer_1: 'Joan of Arc', wrong_answer_2: 'Catherine de Medici', wrong_answer_3: 'Anne of Austria' },
    { difficulty: 'medium', question_text: 'The ancient city of Pompeii was destroyed by the eruption of which volcano in 79 AD?', correct_answer: 'Mount Vesuvius', wrong_answer_1: 'Mount Etna', wrong_answer_2: 'Krakatoa', wrong_answer_3: 'Mount Fuji' },
    { difficulty: 'hard', question_text: 'Which document signed in 1215 limited the power of the English king?', correct_answer: 'Magna Carta', wrong_answer_1: 'Bill of Rights', wrong_answer_2: 'Petition of Right', wrong_answer_3: 'Declaration of Arbroath' },
    { difficulty: 'medium', question_text: 'Who was the first woman to win a Nobel Prize?', correct_answer: 'Marie Curie', wrong_answer_1: 'Jane Addams', wrong_answer_2: 'Mother Teresa', wrong_answer_3: 'Rosalind Franklin' },
    { difficulty: 'medium', question_text: 'In which century did the Black Death peak in Europe?', correct_answer: '14th Century', wrong_answer_1: '12th Century', wrong_answer_2: '16th Century', wrong_answer_3: '10th Century' },
    { difficulty: 'hard', question_text: 'Which battle in 1066 led to the Norman conquest of England?', correct_answer: 'Battle of Hastings', wrong_answer_1: 'Battle of Stamford Bridge', wrong_answer_2: 'Battle of Agincourt', wrong_answer_3: 'Battle of Waterloo' },
    { difficulty: 'easy', question_text: 'Who was the primary author of the Declaration of Independence?', correct_answer: 'Thomas Jefferson', wrong_answer_1: 'Benjamin Franklin', wrong_answer_2: 'John Adams', wrong_answer_3: 'George Washington' },
    { difficulty: 'medium', question_text: 'Which country did the United States purchase Alaska from in 1867?', correct_answer: 'Russia', wrong_answer_1: 'Canada', wrong_answer_2: 'Great Britain', wrong_answer_3: 'France' },
    { difficulty: 'easy', question_text: 'Who was the legendary founder of Rome along with his brother Remus?', correct_answer: 'Romulus', wrong_answer_1: 'Aeneas', wrong_answer_2: 'Augustus', wrong_answer_3: 'Spartacus' },
    { difficulty: 'easy', question_text: 'Which famous trade route connected China to the Mediterranean?', correct_answer: 'The Silk Road', wrong_answer_1: 'The Spice Route', wrong_answer_2: 'The Amber Road', wrong_answer_3: 'The Royal Road' },
    { difficulty: 'easy', question_text: 'In which year did the United States gain independence?', correct_answer: '1776', wrong_answer_1: '1789', wrong_answer_2: '1812', wrong_answer_3: '1765' },
    { difficulty: 'medium', question_text: 'Who was the leader of the Soviet Union during World War II?', correct_answer: 'Joseph Stalin', wrong_answer_1: 'Vladimir Lenin', wrong_answer_2: 'Nikita Khrushchev', wrong_answer_3: 'Leon Trotsky' },
    { difficulty: 'medium', question_text: 'What was the name of the series of military campaigns by Christian states to win back Jerusalem?', correct_answer: 'The Crusades', wrong_answer_1: 'The Inquisition', wrong_answer_2: 'The Reconquista', wrong_answer_3: 'The Reformation' },
    { difficulty: 'hard', question_text: 'Which explorer led the first expedition to sail around the world?', correct_answer: 'Ferdinand Magellan', wrong_answer_1: 'Christopher Columbus', wrong_answer_2: 'Vasco da Gama', wrong_answer_3: 'James Cook' },
    { difficulty: 'medium', question_text: 'Who was the long-reigning Queen of the United Kingdom during the height of the British Empire in the 19th century?', correct_answer: 'Queen Victoria', wrong_answer_1: 'Queen Elizabeth I', wrong_answer_2: 'Queen Mary', wrong_answer_3: 'Queen Anne' },
    { difficulty: 'hard', question_text: 'Which empire was conquered by Hernán Cortés?', correct_answer: 'Aztec Empire', wrong_answer_1: 'Inca Empire', wrong_answer_2: 'Mayan Empire', wrong_answer_3: 'Ottoman Empire' },
    { difficulty: 'easy', question_text: 'Who was the civil rights leader famous for his "I Have a Dream" speech?', correct_answer: 'Martin Luther King Jr.', wrong_answer_1: 'Malcolm X', wrong_answer_2: 'Rosa Parks', wrong_answer_3: 'Nelson Mandela' },
    { difficulty: 'easy', question_text: 'Which country was ruled by the Pharaohs?', correct_answer: 'Egypt', wrong_answer_1: 'Greece', wrong_answer_2: 'Persia', wrong_answer_3: 'Rome' },
    { difficulty: 'medium', question_text: 'In what year did the French Revolution begin?', correct_answer: '1789', wrong_answer_1: '1776', wrong_answer_2: '1804', wrong_answer_3: '1799' },
    { difficulty: 'easy', question_text: 'Which ancient Greek city-state was known for its militaristic society?', correct_answer: 'Sparta', wrong_answer_1: 'Athens', wrong_answer_2: 'Corinth', wrong_answer_3: 'Thebes' },
    { difficulty: 'easy', question_text: 'Who was the first person to step on the Moon?', correct_answer: 'Neil Armstrong', wrong_answer_1: 'Buzz Aldrin', wrong_answer_2: 'Yuri Gagarin', wrong_answer_3: 'Michael Collins' },
    { difficulty: 'easy', question_text: 'Which war was fought between the North and South regions of the United States?', correct_answer: 'American Civil War', wrong_answer_1: 'Revolutionary War', wrong_answer_2: 'War of 1812', wrong_answer_3: 'French and Indian War' }
  ];

  // --- Category: Sports (30 unique questions) ---
  questionsMap['Sports'] = [
    { difficulty: 'easy', question_text: 'How many players are on a standard soccer team on the field?', correct_answer: '11', wrong_answer_1: '10', wrong_answer_2: '12', wrong_answer_3: '9' },
    { difficulty: 'medium', question_text: 'Which country has won the most FIFA World Cups?', correct_answer: 'Brazil', wrong_answer_1: 'Germany', wrong_answer_2: 'Italy', wrong_answer_3: 'Argentina' },
    { difficulty: 'easy', question_text: 'How long is a standard marathon race in miles?', correct_answer: '26.2', wrong_answer_1: '24.2', wrong_answer_2: '28.2', wrong_answer_3: '30.0' },
    { difficulty: 'easy', question_text: 'In which sport do players compete for the Stanley Cup?', correct_answer: 'Ice Hockey', wrong_answer_1: 'Basketball', wrong_answer_2: 'Baseball', wrong_answer_3: 'American Football' },
    { difficulty: 'medium', question_text: 'What is the highest possible score in a single game of 10-pin bowling?', correct_answer: '300', wrong_answer_1: '200', wrong_answer_2: '400', wrong_answer_3: '250' },
    { difficulty: 'easy', question_text: 'Which athlete is widely known as the "Lightning Bolt" and holds the 100m world record?', correct_answer: 'Usain Bolt', wrong_answer_1: 'Carl Lewis', wrong_answer_2: 'Tyson Gay', wrong_answer_3: 'Justin Gatlin' },
    { difficulty: 'medium', question_text: 'How many rings are there on the Olympic flag?', correct_answer: '5', wrong_answer_1: '6', wrong_answer_2: '4', wrong_answer_3: '7' },
    { difficulty: 'easy', question_text: 'In tennis, what word represents a score of zero?', correct_answer: 'Love', wrong_answer_1: 'Nil', wrong_answer_2: 'Zero', wrong_answer_3: 'Blank' },
    { difficulty: 'easy', question_text: 'Which country hosts the famous cycling race, the Tour de France?', correct_answer: 'France', wrong_answer_1: 'Italy', wrong_answer_2: 'Spain', wrong_answer_3: 'Belgium' },
    { difficulty: 'medium', question_text: 'What is the term for scoring three goals in a single soccer match?', correct_answer: 'Hat-trick', wrong_answer_1: 'Trifecta', wrong_answer_2: 'Triple Play', wrong_answer_3: 'Grand Slam' },
    { difficulty: 'medium', question_text: 'Which NBA player is nicknamed "The King"?', correct_answer: 'LeBron James', wrong_answer_1: 'Michael Jordan', wrong_answer_2: 'Kobe Bryant', wrong_answer_3: 'Stephen Curry' },
    { difficulty: 'easy', question_text: 'What color jacket is awarded to the winner of the Masters golf tournament?', correct_answer: 'Green', wrong_answer_1: 'Red', wrong_answer_2: 'Blue', wrong_answer_3: 'Yellow' },
    { difficulty: 'medium', question_text: 'In baseball, how many strikes does it take to strike out a batter?', correct_answer: '3', wrong_answer_1: '4', wrong_answer_2: '2', wrong_answer_3: '5' },
    { difficulty: 'hard', question_text: 'Which country won the first ever FIFA World Cup in 1930?', correct_answer: 'Uruguay', wrong_answer_1: 'Argentina', wrong_answer_2: 'Brazil', wrong_answer_3: 'Italy' },
    { difficulty: 'easy', question_text: 'Which sport uses a shuttlecock instead of a ball?', correct_answer: 'Badminton', wrong_answer_1: 'Table Tennis', wrong_answer_2: 'Squash', wrong_answer_3: 'Tennis' },
    { difficulty: 'medium', question_text: 'How many players are on the court for one team in a standard basketball game?', correct_answer: '5', wrong_answer_1: '6', wrong_answer_2: '7', wrong_answer_3: '8' },
    { difficulty: 'easy', question_text: 'Which sport is known as America\'s Pastime?', correct_answer: 'Baseball', wrong_answer_1: 'American Football', wrong_answer_2: 'Basketball', wrong_answer_3: 'Ice Hockey' },
    { difficulty: 'medium', question_text: 'How many yards is the length of a standard American football field (excluding end zones)?', correct_answer: '100', wrong_answer_1: '110', wrong_answer_2: '120', wrong_answer_3: '90' },
    { difficulty: 'hard', question_text: 'Which female tennis player has won the most Grand Slam singles titles in the Open Era?', correct_answer: 'Serena Williams', wrong_answer_1: 'Steffi Graf', wrong_answer_2: 'Martina Navratilova', wrong_answer_3: 'Margaret Court' },
    { difficulty: 'easy', question_text: 'Which city hosted the 2012 Summer Olympic Games?', correct_answer: 'London', wrong_answer_1: 'Beijing', wrong_answer_2: 'Rio de Janeiro', wrong_answer_3: 'Paris' },
    { difficulty: 'medium', question_text: 'What is the standard weight of a men\'s Olympic discus?', correct_answer: '2 kg', wrong_answer_1: '1.5 kg', wrong_answer_2: '2.5 kg', wrong_answer_3: '3 kg' },
    { difficulty: 'medium', question_text: 'In bowling, what is the term for scoring three consecutive strikes?', correct_answer: 'Turkey', wrong_answer_1: 'Triple', wrong_answer_2: 'Chicken', wrong_answer_3: 'Eagle' },
    { difficulty: 'hard', question_text: 'Who was the first gymnast to be awarded a perfect score of 10.0 in the Olympic Games?', correct_answer: 'Nadia Comaneci', wrong_answer_1: 'Simone Biles', wrong_answer_2: 'Olga Korbut', wrong_answer_3: 'Mary Lou Retton' },
    { difficulty: 'easy', question_text: 'What is the championship game of the National Football League (NFL) called?', correct_answer: 'Super Bowl', wrong_answer_1: 'World Series', wrong_answer_2: 'Stanley Cup', wrong_answer_3: 'Pro Bowl' },
    { difficulty: 'medium', question_text: 'Which heavy-weight boxer famously claimed he could "float like a butterfly, sting like a bee"?', correct_answer: 'Muhammad Ali', wrong_answer_1: 'Mike Tyson', wrong_answer_2: 'Joe Frazier', wrong_answer_3: 'George Foreman' },
    { difficulty: 'easy', question_text: 'Which country is traditionally associated with the sport of Sumo wrestling?', correct_answer: 'Japan', wrong_answer_1: 'China', wrong_answer_2: 'South Korea', wrong_answer_3: 'Mongolia' },
    { difficulty: 'medium', question_text: 'What do the letters NHL stand for?', correct_answer: 'National Hockey League', wrong_answer_1: 'National Handball League', wrong_answer_2: 'New Hockey League', wrong_answer_3: 'National Harriers League' },
    { difficulty: 'hard', question_text: 'In horse racing, what is the middle leg of the American Triple Crown?', correct_answer: 'Preakness Stakes', wrong_answer_1: 'Kentucky Derby', wrong_answer_2: 'Belmont Stakes', wrong_answer_3: 'Breeders\' Cup' },
    { difficulty: 'medium', question_text: 'Which sport involves performing acrobatic moves on a balance beam?', correct_answer: 'Gymnastics', wrong_answer_1: 'Diving', wrong_answer_2: 'Figure Skating', wrong_answer_3: 'Trampolining' },
    { difficulty: 'medium', question_text: 'How many minutes is a standard professional rugby union match?', correct_answer: '80', wrong_answer_1: '90', wrong_answer_2: '60', wrong_answer_3: '70' }
  ];

  // --- Category: Movies (30 unique questions) ---
  questionsMap['Movies'] = [
    { difficulty: 'easy', question_text: 'Which film won the first-ever Academy Award for Best Picture in 1929?', correct_answer: 'Wings', wrong_answer_1: 'Metropolis', wrong_answer_2: 'Sunrise', wrong_answer_3: 'The Jazz Singer' },
    { difficulty: 'medium', question_text: 'Who directed the movie "Inception"?', correct_answer: 'Christopher Nolan', wrong_answer_1: 'Steven Spielberg', wrong_answer_2: 'Quentin Tarantino', wrong_answer_3: 'Martin Scorsese' },
    { difficulty: 'easy', question_text: 'Which actor played the character Neo in the film "The Matrix"?', correct_answer: 'Keanu Reeves', wrong_answer_1: 'Laurence Fishburne', wrong_answer_2: 'Hugo Weaving', wrong_answer_3: 'Brad Pitt' },
    { difficulty: 'easy', question_text: 'What is the name of the fictional kingdom where the movie "Frozen" is set?', correct_answer: 'Arendelle', wrong_answer_1: 'Elvendale', wrong_answer_2: 'Genovia', wrong_answer_3: 'Atlantica' },
    { difficulty: 'easy', question_text: 'In which film did the phrase "May the Force be with you" first appear?', correct_answer: 'Star Wars: A New Hope', wrong_answer_1: 'The Empire Strikes Back', wrong_answer_2: 'Return of the Jedi', wrong_answer_3: 'Star Trek' },
    { difficulty: 'medium', question_text: 'Which movie features the character Captain Jack Sparrow?', correct_answer: 'Pirates of the Caribbean', wrong_answer_1: 'Treasure Island', wrong_answer_2: 'Peter Pan', wrong_answer_3: 'Cast Away' },
    { difficulty: 'medium', question_text: 'What was the first feature-length animated movie ever released?', correct_answer: 'Snow White and the Seven Dwarfs', wrong_answer_1: 'Pinocchio', wrong_answer_2: 'Fantasia', wrong_answer_3: 'Dumbo' },
    { difficulty: 'easy', question_text: 'Which actor played the role of Wolverine in the X-Men movie series?', correct_answer: 'Hugh Jackman', wrong_answer_1: 'Robert Downey Jr.', wrong_answer_2: 'Christian Bale', wrong_answer_3: 'Chris Evans' },
    { difficulty: 'medium', question_text: 'Who played the title role in the 1994 film "Forrest Gump"?', correct_answer: 'Tom Hanks', wrong_answer_1: 'Robin Williams', wrong_answer_2: 'Dustin Hoffman', wrong_answer_3: 'John Travolta' },
    { difficulty: 'hard', question_text: 'Which movie has the highest lifetime box office gross (unadjusted for inflation)?', correct_answer: 'Avatar', wrong_answer_1: 'Avengers: Endgame', wrong_answer_2: 'Titanic', wrong_answer_3: 'Star Wars: The Force Awakens' },
    { difficulty: 'medium', question_text: 'Who directed the classic thriller movie "Psycho"?', correct_answer: 'Alfred Hitchcock', wrong_answer_1: 'Stanley Kubrick', wrong_answer_2: 'Orson Welles', wrong_answer_3: 'Francis Ford Coppola' },
    { difficulty: 'medium', question_text: 'What is the name of the giant gorilla that climbs the Empire State Building?', correct_answer: 'King Kong', wrong_answer_1: 'Mighty Joe Young', wrong_answer_2: 'Gorgo', wrong_answer_3: 'Godzilla' },
    { difficulty: 'easy', question_text: 'In the movie "Harry Potter", what house is Harry assigned to?', correct_answer: 'Gryffindor', wrong_answer_1: 'Slytherin', wrong_answer_2: 'Ravenclaw', wrong_answer_3: 'Hufflepuff' },
    { difficulty: 'medium', question_text: 'What is the name of the virtual reality world in the film "Ready Player One"?', correct_answer: 'The OASIS', wrong_answer_1: 'The Grid', wrong_answer_2: 'The Matrix', wrong_answer_3: 'Decentraland' },
    { difficulty: 'easy', question_text: 'Who is the main protagonist in the "Toy Story" films?', correct_answer: 'Woody', wrong_answer_1: 'Buzz Lightyear', wrong_answer_2: 'Sid', wrong_answer_3: 'Andy' },
    { difficulty: 'medium', question_text: 'Which actor played the Joker in the 2008 film "The Dark Knight"?', correct_answer: 'Heath Ledger', wrong_answer_1: 'Joaquin Phoenix', wrong_answer_2: 'Jack Nicholson', wrong_answer_3: 'Jared Leto' },
    { difficulty: 'hard', question_text: 'For which film did Leonardo DiCaprio win his first Best Actor Academy Award?', correct_answer: 'The Revenant', wrong_answer_1: 'The Wolf of Wall Street', wrong_answer_2: 'Titanic', wrong_answer_3: 'Inception' },
    { difficulty: 'easy', question_text: 'What is the name of the central character in the "Indiana Jones" series?', correct_answer: 'Indiana Jones', wrong_answer_1: 'Han Solo', wrong_answer_2: 'Lara Croft', wrong_answer_3: 'Rick O\'Connell' },
    { difficulty: 'medium', question_text: 'What year was the original "Jurassic Park" movie released?', correct_answer: '1993', wrong_answer_1: '1990', wrong_answer_2: '1996', wrong_answer_3: '1989' },
    { difficulty: 'hard', question_text: 'Which director made the 1994 film "Pulp Fiction"?', correct_answer: 'Quentin Tarantino', wrong_answer_1: 'Martin Scorsese', wrong_answer_2: 'David Fincher', wrong_answer_3: 'Coen Brothers' },
    { difficulty: 'easy', question_text: 'Which superhero is also known as Bruce Wayne?', correct_answer: 'Batman', wrong_answer_1: 'Iron Man', wrong_answer_2: 'Spider-Man', wrong_answer_3: 'Superman' },
    { difficulty: 'medium', question_text: 'Which movie tells the story of the construction and sinking of a luxury ocean liner?', correct_answer: 'Titanic', wrong_answer_1: 'The Poseidon Adventure', wrong_answer_2: 'A Night to Remember', wrong_answer_3: 'Speed 2' },
    { difficulty: 'hard', question_text: 'What is the first rule of Fight Club according to the movie?', correct_answer: 'You do not talk about Fight Club', wrong_answer_1: 'You must fight once', wrong_answer_2: 'Only two guys to a fight', wrong_answer_3: 'No shirts, no shoes' },
    { difficulty: 'easy', question_text: 'What color is the pill Neo takes in "The Matrix"?', correct_answer: 'Red', wrong_answer_1: 'Blue', wrong_answer_2: 'Green', wrong_answer_3: 'Yellow' },
    { difficulty: 'medium', question_text: 'Which actor played Tony Stark in the Marvel Cinematic Universe?', correct_answer: 'Robert Downey Jr.', wrong_answer_1: 'Chris Evans', wrong_answer_2: 'Mark Ruffalo', wrong_answer_3: 'Chris Hemsworth' },
    { difficulty: 'hard', question_text: 'Which movie won the Best Picture Academy Award in 2020 (the first non-English film to do so)?', correct_answer: 'Parasite', wrong_answer_1: '1917', wrong_answer_2: 'Once Upon a Time in Hollywood', wrong_answer_3: 'Joker' },
    { difficulty: 'easy', question_text: 'What type of animal is Simba in "The Lion King"?', correct_answer: 'Lion', wrong_answer_1: 'Tiger', wrong_answer_2: 'Leopard', wrong_answer_3: 'Cheetah' },
    { difficulty: 'medium', question_text: 'Who played the role of Jack Dawson in "Titanic"?', correct_answer: 'Leonardo DiCaprio', wrong_answer_1: 'Johnny Depp', wrong_answer_2: 'Brad Pitt', wrong_answer_3: 'Matt Damon' },
    { difficulty: 'medium', question_text: 'What classic movie features the line "Here\'s looking at you, kid"?', correct_answer: 'Casablanca', wrong_answer_1: 'Citizen Kane', wrong_answer_2: 'Gone with the Wind', wrong_answer_3: 'The Wizard of Oz' },
    { difficulty: 'hard', question_text: 'Who directed the 1972 crime film "The Godfather"?', correct_answer: 'Francis Ford Coppola', wrong_answer_1: 'Martin Scorsese', wrong_answer_2: 'Brian De Palma', wrong_answer_3: 'Roman Polanski' }
  ];

  // --- Category: Music (30 unique questions) ---
  questionsMap['Music'] = [
    { difficulty: 'easy', question_text: 'How many keys are on a standard piano?', correct_answer: '88', wrong_answer_1: '85', wrong_answer_2: '90', wrong_answer_3: '80' },
    { difficulty: 'medium', question_text: 'Who is known as the "King of Pop"?', correct_answer: 'Michael Jackson', wrong_answer_1: 'Elvis Presley', wrong_answer_2: 'Prince', wrong_answer_3: 'Madonna' },
    { difficulty: 'medium', question_text: 'Which English rock band released the album "The Dark Side of the Moon"?', correct_answer: 'Pink Floyd', wrong_answer_1: 'Led Zeppelin', wrong_answer_2: 'The Beatles', wrong_answer_3: 'Queen' },
    { difficulty: 'medium', question_text: 'Who composed the famous "Moonlight Sonata"?', correct_answer: 'Ludwig van Beethoven', wrong_answer_1: 'Wolfgang Amadeus Mozart', wrong_answer_2: 'Johann Sebastian Bach', wrong_answer_3: 'Franz Schubert' },
    { difficulty: 'medium', question_text: 'What is the highest female singing voice type?', correct_answer: 'Soprano', wrong_answer_1: 'Alto', wrong_answer_2: 'Mezzo-Soprano', wrong_answer_3: 'Contralto' },
    { difficulty: 'easy', question_text: 'Which pop singer is known for her album "1989" and the hit "Shake It Off"?', correct_answer: 'Taylor Swift', wrong_answer_1: 'Katy Perry', wrong_answer_2: 'Ariana Grande', wrong_answer_3: 'Selena Gomez' },
    { difficulty: 'easy', question_text: 'Who was the lead singer of the rock band Queen?', correct_answer: 'Freddie Mercury', wrong_answer_1: 'Mick Jagger', wrong_answer_2: 'Robert Plant', wrong_answer_3: 'David Bowie' },
    { difficulty: 'easy', question_text: 'How many members were in the famous pop band "The Beatles"?', correct_answer: '4', wrong_answer_1: '3', wrong_answer_2: '5', wrong_answer_3: '6' },
    { difficulty: 'medium', question_text: 'Which instrument has four strings and is tuned in fifths (G, D, A, E)?', correct_answer: 'Violin', wrong_answer_1: 'Viola', wrong_answer_2: 'Cello', wrong_answer_3: 'Guitar' },
    { difficulty: 'medium', question_text: 'What music genre originated in New Orleans in the late 19th and early 20th centuries?', correct_answer: 'Jazz', wrong_answer_1: 'Blues', wrong_answer_2: 'Country', wrong_answer_3: 'Rock and Roll' },
    { difficulty: 'easy', question_text: 'Which artist released the global smash hit "Baby" in 2010?', correct_answer: 'Justin Bieber', wrong_answer_1: 'One Direction', wrong_answer_2: 'Shawn Mendes', wrong_answer_3: 'Bruno Mars' },
    { difficulty: 'medium', question_text: 'Who wrote the classical music piece "The Four Seasons"?', correct_answer: 'Antonio Vivaldi', wrong_answer_1: 'Johann Sebastian Bach', wrong_answer_2: 'George Frideric Handel', wrong_answer_3: 'Pyotr Ilyich Tchaikovsky' },
    { difficulty: 'hard', question_text: 'What is the title of the national anthem of the United States?', correct_answer: 'The Star-Spangled Banner', wrong_answer_1: 'America the Beautiful', wrong_answer_2: 'God Bless America', wrong_answer_3: 'My Country, \'Tis of Thee' },
    { difficulty: 'easy', question_text: 'Which legendary singer sang "My Way" and "Fly Me to the Moon"?', correct_answer: 'Frank Sinatra', wrong_answer_1: 'Dean Martin', wrong_answer_2: 'Tony Bennett', wrong_answer_3: 'Nat King Cole' },
    { difficulty: 'medium', question_text: 'What singer-songwriter released the album "Purple Rain" in 1984?', correct_answer: 'Prince', wrong_answer_1: 'Michael Jackson', wrong_answer_2: 'David Bowie', wrong_answer_3: 'Lionel Richie' },
    { difficulty: 'hard', question_text: 'Which opera composer wrote "La Boheme" and "Madama Butterfly"?', correct_answer: 'Giacomo Puccini', wrong_answer_1: 'Giuseppe Verdi', wrong_answer_2: 'Gioachino Rossini', wrong_answer_3: 'Richard Wagner' },
    { difficulty: 'easy', question_text: 'Which music group is famous for hits like "Dancing Queen" and "Mamma Mia"?', correct_answer: 'ABBA', wrong_answer_1: 'Bee Gees', wrong_answer_2: 'Boney M.', wrong_answer_3: 'Fleetwood Mac' },
    { difficulty: 'medium', question_text: 'Who is the lead singer of the Irish rock band U2?', correct_answer: 'Bono', wrong_answer_1: 'The Edge', wrong_answer_2: 'Bob Geldof', wrong_answer_3: 'Chris Martin' },
    { difficulty: 'easy', question_text: 'Which musical instrument is characterized by black and white keys, hammers, and strings?', correct_answer: 'Piano', wrong_answer_1: 'Harpsichord', wrong_answer_2: 'Accordion', wrong_answer_3: 'Synthesizer' },
    { difficulty: 'medium', question_text: 'Which artist is known as the "Queen of Soul"?', correct_answer: 'Aretha Franklin', wrong_answer_1: 'Diana Ross', wrong_answer_2: 'Whitney Houston', wrong_answer_3: 'Tina Turner' },
    { difficulty: 'hard', question_text: 'Which music festival took place in upstate New York in August 1969?', correct_answer: 'Woodstock', wrong_answer_1: 'Monterey Pop Festival', wrong_answer_2: 'Lollapalooza', wrong_answer_3: 'Coachella' },
    { difficulty: 'medium', question_text: 'What woodwind instrument is played by blowing into a double reed?', correct_answer: 'Oboe', wrong_answer_1: 'Flute', wrong_answer_2: 'Clarinet', wrong_answer_3: 'Saxophone' },
    { difficulty: 'easy', question_text: 'Which electronic music duo wore robot helmets and released "Random Access Memories"?', correct_answer: 'Daft Punk', wrong_answer_1: 'The Chemical Brothers', wrong_answer_2: 'Justice', wrong_answer_3: 'Disclosure' },
    { difficulty: 'medium', question_text: 'Which artist released the album "21" containing the hit "Rolling in the Deep"?', correct_answer: 'Adele', wrong_answer_1: 'Amy Winehouse', wrong_answer_2: 'Duffy', wrong_answer_3: 'Lana Del Rey' },
    { difficulty: 'medium', question_text: 'Who is the lead vocalist of the band Coldplay?', correct_answer: 'Chris Martin', wrong_answer_1: 'Thom Yorke', wrong_answer_2: 'Matt Bellamy', wrong_answer_3: 'Brandon Flowers' },
    { difficulty: 'hard', question_text: 'In musical terminology, what tempo marking indicates a slow, solemn speed?', correct_answer: 'Adagio', wrong_answer_1: 'Allegro', wrong_answer_2: 'Presto', wrong_answer_3: 'Andante' },
    { difficulty: 'easy', question_text: 'What stringed instrument is traditionally associated with Hawaii?', correct_answer: 'Ukulele', wrong_answer_1: 'Banjo', wrong_answer_2: 'Mandolin', wrong_answer_3: 'Lute' },
    { difficulty: 'medium', question_text: 'Which rapper released the critically acclaimed album "To Pimp a Butterfly"?', correct_answer: 'Kendrick Lamar', wrong_answer_1: 'Drake', wrong_answer_2: 'J. Cole', wrong_answer_3: 'Kanye West' },
    { difficulty: 'easy', question_text: 'Who is known as the "King of Country Music"?', correct_answer: 'George Strait', wrong_answer_1: 'Garth Brooks', wrong_answer_2: 'Johnny Cash', wrong_answer_3: 'Alan Jackson' },
    { difficulty: 'hard', question_text: 'Which German composer wrote "The Brandenburg Concertos"?', correct_answer: 'Johann Sebastian Bach', wrong_answer_1: 'Ludwig van Beethoven', wrong_answer_2: 'Johannes Brahms', wrong_answer_3: 'Richard Strauss' }
  ];

  // --- Category: Technology (30 unique questions) ---
  questionsMap['Technology'] = [
    { difficulty: 'easy', question_text: 'What does CPU stand for?', correct_answer: 'Central Processing Unit', wrong_answer_1: 'Computer Processing Unit', wrong_answer_2: 'Central Processor Utility', wrong_answer_3: 'Control Processing Unit' },
    { difficulty: 'medium', question_text: 'Who co-founded Microsoft alongside Bill Gates?', correct_answer: 'Paul Allen', wrong_answer_1: 'Steve Jobs', wrong_answer_2: 'Steve Ballmer', wrong_answer_3: 'Larry Page' },
    { difficulty: 'easy', question_text: 'Which programming language is commonly used for styled web content layout?', correct_answer: 'CSS', wrong_answer_1: 'HTML', wrong_answer_2: 'Python', wrong_answer_3: 'SQL' },
    { difficulty: 'medium', question_text: 'What does SQL stand for?', correct_answer: 'Structured Query Language', wrong_answer_1: 'Simple Query Language', wrong_answer_2: 'System Query Language', wrong_answer_3: 'Sequential Query Language' },
    { difficulty: 'medium', question_text: 'Which operating system uses the Linux kernel and is developed by Google?', correct_answer: 'Android', wrong_answer_1: 'iOS', wrong_answer_2: 'ChromeOS', wrong_answer_3: 'Windows' },
    { difficulty: 'easy', question_text: 'What is the primary language used for markup on the World Wide Web?', correct_answer: 'HTML', wrong_answer_1: 'CSS', wrong_answer_2: 'XML', wrong_answer_3: 'JSON' },
    { difficulty: 'easy', question_text: 'Which company developed the iPhone?', correct_answer: 'Apple', wrong_answer_1: 'Samsung', wrong_answer_2: 'Google', wrong_answer_3: 'Microsoft' },
    { difficulty: 'medium', question_text: 'In what year was the first model of the iPhone released?', correct_answer: '2007', wrong_answer_1: '2005', wrong_answer_2: '2009', wrong_answer_3: '2006' },
    { difficulty: 'easy', question_text: 'What does the abbreviation "URL" stand for?', correct_answer: 'Uniform Resource Locator', wrong_answer_1: 'Universal Resource Link', wrong_answer_2: 'Uniform Response Locator', wrong_answer_3: 'Universal Recovery Locator' },
    { difficulty: 'medium', question_text: 'Which programming language is known for its mascot, a blue gopher?', correct_answer: 'Go', wrong_answer_1: 'Java', wrong_answer_2: 'Rust', wrong_answer_3: 'Python' },
    { difficulty: 'medium', question_text: 'What is the name of Google\'s web browser?', correct_answer: 'Chrome', wrong_answer_1: 'Safari', wrong_answer_2: 'Firefox', wrong_answer_3: 'Edge' },
    { difficulty: 'easy', question_text: 'What does "RAM" stand for in computing terms?', correct_answer: 'Random Access Memory', wrong_answer_1: 'Read Access Memory', wrong_answer_2: 'Rapid Active Module', wrong_answer_3: 'Random Active Memory' },
    { difficulty: 'hard', question_text: 'Which protocol is used to securely transfer hypertext pages over the internet?', correct_answer: 'HTTPS', wrong_answer_1: 'HTTP', wrong_answer_2: 'FTP', wrong_answer_3: 'SMTP' },
    { difficulty: 'medium', question_text: 'Who is known as the inventor of the World Wide Web?', correct_answer: 'Tim Berners-Lee', wrong_answer_1: 'Steve Jobs', wrong_answer_2: 'Bill Gates', wrong_answer_3: 'Alan Turing' },
    { difficulty: 'medium', question_text: 'What is the main operating system for Apple computers?', correct_answer: 'macOS', wrong_answer_1: 'Windows', wrong_answer_2: 'Linux', wrong_answer_3: 'iOS' },
    { difficulty: 'easy', question_text: 'Which of these is a popular programming language used heavily in Data Science and Machine Learning?', correct_answer: 'Python', wrong_answer_1: 'C++', wrong_answer_2: 'HTML', wrong_answer_3: 'Java' },
    { difficulty: 'hard', question_text: 'What does the term "DNS" stand for in networking?', correct_answer: 'Domain Name System', wrong_answer_1: 'Domain Network Service', wrong_answer_2: 'Dynamic Name System', wrong_answer_3: 'Digital Network Schema' },
    { difficulty: 'easy', question_text: 'What is the name of Microsoft\'s artificial intelligence assistant launched in Windows 11?', correct_answer: 'Copilot', wrong_answer_1: 'Cortana', wrong_answer_2: 'Siri', wrong_answer_3: 'Alexa' },
    { difficulty: 'medium', question_text: 'Which company acquired GitHub in 2018?', correct_answer: 'Microsoft', wrong_answer_1: 'Google', wrong_answer_2: 'Amazon', wrong_answer_3: 'Facebook' },
    { difficulty: 'hard', question_text: 'What is the default port number for secure web traffic (HTTPS)?', correct_answer: '443', wrong_answer_1: '80', wrong_answer_2: '8080', wrong_answer_3: '22' },
    { difficulty: 'easy', question_text: 'Which tech company is famous for its search engine and Android OS?', correct_answer: 'Google', wrong_answer_1: 'Microsoft', wrong_answer_2: 'Apple', wrong_answer_3: 'Yahoo' },
    { difficulty: 'medium', question_text: 'What was the first commercial programming language, developed by IBM in the 1950s?', correct_answer: 'Fortran', wrong_answer_1: 'COBOL', wrong_answer_2: 'Lisp', wrong_answer_3: 'BASIC' },
    { difficulty: 'hard', question_text: 'Which sorting algorithm has an average time complexity of O(n log n)?', correct_answer: 'Quick Sort', wrong_answer_1: 'Bubble Sort', wrong_answer_2: 'Insertion Sort', wrong_answer_3: 'Selection Sort' },
    { difficulty: 'easy', question_text: 'Which device is used to connect local computer networks to the wider internet?', correct_answer: 'Router', wrong_answer_1: 'Switch', wrong_answer_2: 'Monitor', wrong_answer_3: 'Keyboard' },
    { difficulty: 'medium', question_text: 'Which programming language is designed to run in the browser to add interactivity to web pages?', correct_answer: 'JavaScript', wrong_answer_1: 'Python', wrong_answer_2: 'C#', wrong_answer_3: 'Ruby' },
    { difficulty: 'hard', question_text: 'What does the abbreviation "JSON" stand for?', correct_answer: 'JavaScript Object Notation', wrong_answer_1: 'Java Standard Object Network', wrong_answer_2: 'JavaScript Oriented Network', wrong_answer_3: 'Java System Outline Number' },
    { difficulty: 'easy', question_text: 'What is the name of the popular cloud storage service provided by Google?', correct_answer: 'Google Drive', wrong_answer_1: 'Dropbox', wrong_answer_2: 'OneDrive', wrong_answer_3: 'iCloud' },
    { difficulty: 'medium', question_text: 'Which database type organizes data into rows and tables with primary/foreign keys?', correct_answer: 'Relational Database', wrong_answer_1: 'NoSQL Database', wrong_answer_2: 'Graph Database', wrong_answer_3: 'Key-Value Store' },
    { difficulty: 'medium', question_text: 'Which technology company is known for its GeForce graphics cards?', correct_answer: 'NVIDIA', wrong_answer_1: 'AMD', wrong_answer_2: 'Intel', wrong_answer_3: 'ASUS' },
    { difficulty: 'hard', question_text: 'Who wrote the first computer program, designed for Charles Babbage\'s Analytical Engine?', correct_answer: 'Ada Lovelace', wrong_answer_1: 'Grace Hopper', wrong_answer_2: 'Alan Turing', wrong_answer_3: 'Charles Babbage' }
  ];

  // --- Category: Literature (30 unique questions) ---
  questionsMap['Literature'] = [
    { difficulty: 'easy', question_text: 'Who wrote the play "Romeo and Juliet"?', correct_answer: 'William Shakespeare', wrong_answer_1: 'Charles Dickens', wrong_answer_2: 'Mark Twain', wrong_answer_3: 'Jane Austen' },
    { difficulty: 'medium', question_text: 'What is the name of the wizarding school in the Harry Potter series?', correct_answer: 'Hogwarts', wrong_answer_1: 'Beauxbatons', wrong_answer_2: 'Durmstrang', wrong_answer_3: 'Ilvermorny' },
    { difficulty: 'medium', question_text: 'Which classic novel begins with the line "Call me Ishmael"?', correct_answer: 'Moby-Dick', wrong_answer_1: 'The Great Gatsby', wrong_answer_2: 'Don Quixote', wrong_answer_3: 'Ulysses' },
    { difficulty: 'medium', question_text: 'Who wrote the dystopian novel "1984"?', correct_answer: 'George Orwell', wrong_answer_1: 'Aldous Huxley', wrong_answer_2: 'Ray Bradbury', wrong_answer_3: 'H.G. Wells' },
    { difficulty: 'medium', question_text: 'What is the title of the first book in "The Lord of the Rings" trilogy?', correct_answer: 'The Fellowship of the Ring', wrong_answer_1: 'The Two Towers', wrong_answer_2: 'The Return of the King', wrong_answer_3: 'The Hobbit' },
    { difficulty: 'easy', question_text: 'Which author wrote "The Hobbit" and "The Lord of the Rings"?', correct_answer: 'J.R.R. Tolkien', wrong_answer_1: 'C.S. Lewis', wrong_answer_2: 'George R.R. Martin', wrong_answer_3: 'J.K. Rowling' },
    { difficulty: 'easy', question_text: 'What is the name of the main character in the novel "Don Quixote"?', correct_answer: 'Don Quixote', wrong_answer_1: 'Sancho Panza', wrong_answer_2: 'Dulcinea', wrong_answer_3: 'El Cid' },
    { difficulty: 'medium', question_text: 'Who wrote the gothic novel "Frankenstein"?', correct_answer: 'Mary Shelley', wrong_answer_1: 'Bram Stoker', wrong_answer_2: 'Edgar Allan Poe', wrong_answer_3: 'Jane Austen' },
    { difficulty: 'easy', question_text: 'In which play does the character Hamlet appear?', correct_answer: 'Hamlet', wrong_answer_1: 'Macbeth', wrong_answer_2: 'Othello', wrong_answer_3: 'King Lear' },
    { difficulty: 'medium', question_text: 'Who wrote the Victorian-era novel "Pride and Prejudice"?', correct_answer: 'Jane Austen', wrong_answer_1: 'Charlotte Bronte', wrong_answer_2: 'Emily Bronte', wrong_answer_3: 'George Eliot' },
    { difficulty: 'hard', question_text: 'What is the title of the ancient Mesopotamian epic poem often cited as the earliest surviving great work of literature?', correct_answer: 'Epic of Gilgamesh', wrong_answer_1: 'The Odyssey', wrong_answer_2: 'The Iliad', wrong_answer_3: 'The Mahabharata' },
    { difficulty: 'medium', question_text: 'Who wrote the classic children\'s novel "Alice\'s Adventures in Wonderland"?', correct_answer: 'Lewis Carroll', wrong_answer_1: 'Hans Christian Andersen', wrong_answer_2: 'Brothers Grimm', wrong_answer_3: 'Roald Dahl' },
    { difficulty: 'hard', question_text: 'Which Russian author wrote "War and Peace" and "Anna Karenina"?', correct_answer: 'Leo Tolstoy', wrong_answer_1: 'Fyodor Dostoevsky', wrong_answer_2: 'Anton Chekhov', wrong_answer_3: 'Vladimir Nabokov' },
    { difficulty: 'easy', question_text: 'What is the name of the detective created by Sir Arthur Conan Doyle?', correct_answer: 'Sherlock Holmes', wrong_answer_1: 'Hercule Poirot', wrong_answer_2: 'Miss Marple', wrong_answer_3: 'Sam Spade' },
    { difficulty: 'medium', question_text: 'Who wrote the American classic "The Great Gatsby"?', correct_answer: 'F. Scott Fitzgerald', wrong_answer_1: 'Ernest Hemingway', wrong_answer_2: 'John Steinbeck', wrong_answer_3: 'William Faulkner' },
    { difficulty: 'hard', question_text: 'Which novel by Gabriel García Márquez is considered a masterpiece of magic realism?', correct_answer: 'One Hundred Years of Solitude', wrong_answer_1: 'Love in the Time of Cholera', wrong_answer_2: 'The House of the Spirits', wrong_answer_3: 'Pedro Páramo' },
    { difficulty: 'medium', question_text: 'Who is the author of the dystopian novel "Brave New World"?', correct_answer: 'Aldous Huxley', wrong_answer_1: 'George Orwell', wrong_answer_2: 'Ray Bradbury', wrong_answer_3: 'Margaret Atwood' },
    { difficulty: 'easy', question_text: 'Which author wrote the series "A Song of Ice and Fire", which adapted into Game of Thrones?', correct_answer: 'George R.R. Martin', wrong_answer_1: 'J.R.R. Tolkien', wrong_answer_2: 'Robert Jordan', wrong_answer_3: 'Brandon Sanderson' },
    { difficulty: 'easy', question_text: 'Who wrote the classic adventure book "Treasure Island"?', correct_answer: 'Robert Louis Stevenson', wrong_answer_1: 'Jules Verne', wrong_answer_2: 'Mark Twain', wrong_answer_3: 'Jack London' },
    { difficulty: 'medium', question_text: 'Which novel features the characters Pip, Miss Havisham, and Estella?', correct_answer: 'Great Expectations', wrong_answer_1: 'Oliver Twist', wrong_answer_2: 'David Copperfield', wrong_answer_3: 'Bleak House' },
    { difficulty: 'hard', question_text: 'What is the title of Homer\'s epic poem detailing the journey home of Odysseus?', correct_answer: 'The Odyssey', wrong_answer_1: 'The Iliad', wrong_answer_2: 'The Aeneid', wrong_answer_3: 'The Argonautica' },
    { difficulty: 'easy', question_text: 'Who wrote the classic book "The Adventures of Tom Sawyer"?', correct_answer: 'Mark Twain', wrong_answer_1: 'Charles Dickens', wrong_answer_2: 'Herman Melville', wrong_answer_3: 'Jack London' },
    { difficulty: 'medium', question_text: 'Who wrote the horror novel "Dracula"?', correct_answer: 'Bram Stoker', wrong_answer_1: 'Mary Shelley', wrong_answer_2: 'Edgar Allan Poe', wrong_answer_3: 'Stephen King' },
    { difficulty: 'hard', question_text: 'Which poet wrote the epic work "The Divine Comedy"?', correct_answer: 'Dante Alighieri', wrong_answer_1: 'Geoffrey Chaucer', wrong_answer_2: 'John Milton', wrong_answer_3: 'William Shakespeare' },
    { difficulty: 'medium', question_text: 'What is the main theme or setting of the novel "Fahrenheit 451" by Ray Bradbury?', correct_answer: 'A future where books are banned and burned', wrong_answer_1: 'A deep-space exploratory mission', wrong_answer_2: 'An undersea research base', wrong_answer_3: 'A high-fantasy medieval realm' },
    { difficulty: 'easy', question_text: 'Who wrote the classic story "A Christmas Carol"?', correct_answer: 'Charles Dickens', wrong_answer_1: 'William Shakespeare', wrong_answer_2: 'Jane Austen', wrong_answer_3: 'Mark Twain' },
    { difficulty: 'medium', question_text: 'Which author wrote the historical adventure "The Three Musketeers"?', correct_answer: 'Alexandre Dumas', wrong_answer_1: 'Victor Hugo', wrong_answer_2: 'Jules Verne', wrong_answer_3: 'Gustave Flaubert' },
    { difficulty: 'hard', question_text: 'Who wrote the existentialist novella "The Metamorphosis", in which a man turns into an insect?', correct_answer: 'Franz Kafka', wrong_answer_1: 'Albert Camus', wrong_answer_2: 'Jean-Paul Sartre', wrong_answer_3: 'Friedrich Nietzsche' },
    { difficulty: 'medium', question_text: 'What is the title of the fantasy novel series about a boy named Percy Jackson who discovers he is a demigod?', correct_answer: 'Percy Jackson & the Olympians', wrong_answer_1: 'The Chronicles of Narnia', wrong_answer_2: 'Artemis Fowl', wrong_answer_3: 'His Dark Materials' },
    { difficulty: 'hard', question_text: 'Which writer wrote the monumental French novel series "In Search of Lost Time"?', correct_answer: 'Marcel Proust', wrong_answer_1: 'Albert Camus', wrong_answer_2: 'Victor Hugo', wrong_answer_3: 'Jean-Paul Sartre' }
  ];

  // --- Category: Art (30 unique questions) ---
  questionsMap['Art'] = [
    { difficulty: 'easy', question_text: 'Who painted the "Mona Lisa"?', correct_answer: 'Leonardo da Vinci', wrong_answer_1: 'Vincent van Gogh', wrong_answer_2: 'Pablo Picasso', wrong_answer_3: 'Michelangelo' },
    { difficulty: 'medium', question_text: 'Which artist cut off his own left ear?', correct_answer: 'Vincent van Gogh', wrong_answer_1: 'Claude Monet', wrong_answer_2: 'Salvador Dalí', wrong_answer_3: 'Edvard Munch' },
    { difficulty: 'medium', question_text: 'In which city is the Louvre Museum located?', correct_answer: 'Paris', wrong_answer_1: 'Rome', wrong_answer_2: 'London', wrong_answer_3: 'Madrid' },
    { difficulty: 'medium', question_text: 'Which art movement is Salvador Dalí associated with?', correct_answer: 'Surrealism', wrong_answer_1: 'Impressionism', wrong_answer_2: 'Cubism', wrong_answer_3: 'Expressionism' },
    { difficulty: 'medium', question_text: 'Who sculpted the famous statue "David"?', correct_answer: 'Michelangelo', wrong_answer_1: 'Donatello', wrong_answer_2: 'Bernini', wrong_answer_3: 'Rodin' },
    { difficulty: 'easy', question_text: 'Which Spanish artist is famous for co-founding the Cubist movement?', correct_answer: 'Pablo Picasso', wrong_answer_1: 'Salvador Dalí', wrong_answer_2: 'Francisco Goya', wrong_answer_3: 'Diego Velázquez' },
    { difficulty: 'easy', question_text: 'Who painted the famous mural "The Last Supper"?', correct_answer: 'Leonardo da Vinci', wrong_answer_1: 'Michelangelo', wrong_answer_2: 'Raphael', wrong_answer_3: 'Sandro Botticelli' },
    { difficulty: 'medium', question_text: 'Which Dutch post-impressionist painted "The Starry Night"?', correct_answer: 'Vincent van Gogh', wrong_answer_1: 'Rembrandt', wrong_answer_2: 'Johannes Vermeer', wrong_answer_3: 'Piet Mondrian' },
    { difficulty: 'easy', question_text: 'What famous chapel has a ceiling painted by Michelangelo?', correct_answer: 'Sistine Chapel', wrong_answer_1: 'St. Peter\'s Basilica', wrong_answer_2: 'Notre-Dame', wrong_answer_3: 'St. Paul\'s Cathedral' },
    { difficulty: 'medium', question_text: 'Who painted "The Scream" in 1893?', correct_answer: 'Edvard Munch', wrong_answer_1: 'Gustav Klimt', wrong_answer_2: 'Egon Schiele', wrong_answer_3: 'Wassily Kandinsky' },
    { difficulty: 'hard', question_text: 'Which art style did Claude Monet help pioneer?', correct_answer: 'Impressionism', wrong_answer_1: 'Surrealism', wrong_answer_2: 'Realism', wrong_answer_3: 'Dadaism' },
    { difficulty: 'medium', question_text: 'Which artist is known for painting Campbell\'s Soup Cans and Marilyn Monroe portraits?', correct_answer: 'Andy Warhol', wrong_answer_1: 'Roy Lichtenstein', wrong_answer_2: 'Jackson Pollock', wrong_answer_3: 'Keith Haring' },
    { difficulty: 'hard', question_text: 'Who painted "Girl with a Pearl Earring" around 1665?', correct_answer: 'Johannes Vermeer', wrong_answer_1: 'Rembrandt', wrong_answer_2: 'Peter Paul Rubens', wrong_answer_3: 'Frans Hals' },
    { difficulty: 'easy', question_text: 'Which Italian artist painted "The Birth of Venus"?', correct_answer: 'Sandro Botticelli', wrong_answer_1: 'Leonardo da Vinci', wrong_answer_2: 'Michelangelo', wrong_answer_3: 'Raphael' },
    { difficulty: 'medium', question_text: 'Who is the famous Mexican female painter known for her self-portraits and colorful style?', correct_answer: 'Frida Kahlo', wrong_answer_1: 'Diego Rivera', wrong_answer_2: 'Leonora Carrington', wrong_answer_3: 'Maria Izquierdo' },
    { difficulty: 'hard', question_text: 'Which artist painted "Guernica", representing the bombing of a Basque town?', correct_answer: 'Pablo Picasso', wrong_answer_1: 'Joan Miró', wrong_answer_2: 'Salvador Dalí', wrong_answer_3: 'Francisco Goya' },
    { difficulty: 'medium', question_text: 'Which American painter is famous for his drip-painting technique?', correct_answer: 'Jackson Pollock', wrong_answer_1: 'Mark Rothko', wrong_answer_2: 'Willem de Kooning', wrong_answer_3: 'Edward Hopper' },
    { difficulty: 'hard', question_text: 'Who sculpted the famous bronze sculpture "The Thinker"?', correct_answer: 'Auguste Rodin', wrong_answer_1: 'Michelangelo', wrong_answer_2: 'Gian Lorenzo Bernini', wrong_answer_3: 'Alberto Giacometti' },
    { difficulty: 'easy', question_text: 'What material is traditionally carved to make sculptures like Michelangelo\'s David?', correct_answer: 'Marble', wrong_answer_1: 'Clay', wrong_answer_2: 'Bronze', wrong_answer_3: 'Granite' },
    { difficulty: 'medium', question_text: 'Who painted the realistic portrait "American Gothic" featuring a farmer and his daughter holding a pitchfork?', correct_answer: 'Grant Wood', wrong_answer_1: 'Edward Hopper', wrong_answer_2: 'Andrew Wyeth', wrong_answer_3: 'Norman Rockwell' },
    { difficulty: 'hard', question_text: 'Which art movement emerged in Zurich during WWI as a reaction against the horrors of war?', correct_answer: 'Dadaism', wrong_answer_1: 'Cubism', wrong_answer_2: 'Fauvism', wrong_answer_3: 'Futurism' },
    { difficulty: 'medium', question_text: 'Which French painter is famous for his paintings of water lilies?', correct_answer: 'Claude Monet', wrong_answer_1: 'Pierre-Auguste Renoir', wrong_answer_2: 'Paul Cézanne', wrong_answer_3: 'Edgar Degas' },
    { difficulty: 'easy', question_text: 'What are the three primary colors in paint?', correct_answer: 'Red, Yellow, Blue', wrong_answer_1: 'Red, Green, Blue', wrong_answer_2: 'Orange, Green, Purple', wrong_answer_3: 'Cyan, Magenta, Yellow' },
    { difficulty: 'medium', question_text: 'Who painted the highly gold-detailed painting "The Kiss"?', correct_answer: 'Gustav Klimt', wrong_answer_1: 'Edvard Munch', wrong_answer_2: 'Egon Schiele', wrong_answer_3: 'Henri Matisse' },
    { difficulty: 'hard', question_text: 'Which French sculptor designed the Statue of Liberty?', correct_answer: 'Frédéric Auguste Bartholdi', wrong_answer_1: 'Auguste Rodin', wrong_answer_2: 'Gustave Eiffel', wrong_answer_3: 'Jean-Baptiste Carpeaux' },
    { difficulty: 'easy', question_text: 'In which museum is the original "Mona Lisa" displayed?', correct_answer: 'The Louvre', wrong_answer_1: 'The British Museum', wrong_answer_2: 'The Met', wrong_answer_3: 'The Prado' },
    { difficulty: 'medium', question_text: 'Which artist is known for his sculpture of a urinating fountain signed "R. Mutt" (Dadaism)?', correct_answer: 'Marcel Duchamp', wrong_answer_1: 'Man Ray', wrong_answer_2: 'Max Ernst', wrong_answer_3: 'Francis Picabia' },
    { difficulty: 'hard', question_text: 'Who painted the ceiling of the Paris Opera house in 1964?', correct_answer: 'Marc Chagall', wrong_answer_1: 'Pablo Picasso', wrong_answer_2: 'Henri Matisse', wrong_answer_3: 'Joan Miró' },
    { difficulty: 'easy', question_text: 'What medium involves arranging small pieces of colored glass or stone to form an image?', correct_answer: 'Mosaic', wrong_answer_1: 'Fresco', wrong_answer_2: 'Tapestry', wrong_answer_3: 'Collage' },
    { difficulty: 'medium', question_text: 'Which artist painted "The Persistence of Memory" featuring melting clocks?', correct_answer: 'Salvador Dalí', wrong_answer_1: 'Max Ernst', wrong_answer_2: 'René Magritte', wrong_answer_3: 'Joan Miró' }
  ];

  // --- Category: Food (30 unique questions) ---
  questionsMap['Food'] = [
    { difficulty: 'easy', question_text: 'What is the main ingredient in traditional guacamole?', correct_answer: 'Avocado', wrong_answer_1: 'Tomato', wrong_answer_2: 'Onion', wrong_answer_3: 'Lime' },
    { difficulty: 'medium', question_text: 'Which country is the origin of the Margherita pizza?', correct_answer: 'Italy', wrong_answer_1: 'France', wrong_answer_2: 'Spain', wrong_answer_3: 'Greece' },
    { difficulty: 'medium', question_text: 'Which spice is made from the dried stigmas of the Crocus sativus flower?', correct_answer: 'Saffron', wrong_answer_1: 'Turmeric', wrong_answer_2: 'Cardamom', wrong_answer_3: 'Cumin' },
    { difficulty: 'medium', question_text: 'What is the primary leavening agent used in traditional sourdough bread?', correct_answer: 'Wild Yeast', wrong_answer_1: 'Baking Powder', wrong_answer_2: 'Baking Soda', wrong_answer_3: 'Active Dry Yeast' },
    { difficulty: 'medium', question_text: 'What is the main type of alcohol used in a classic Mojito cocktail?', correct_answer: 'Rum', wrong_answer_1: 'Vodka', wrong_answer_2: 'Tequila', wrong_answer_3: 'Gin' },
    { difficulty: 'easy', question_text: 'Which country is famous for the dish Sushi?', correct_answer: 'Japan', wrong_answer_1: 'China', wrong_answer_2: 'Thailand', wrong_answer_3: 'Vietnam' },
    { difficulty: 'easy', question_text: 'What is the main ingredient in tofu?', correct_answer: 'Soybeans', wrong_answer_1: 'Rice', wrong_answer_2: 'Wheat', wrong_answer_3: 'Peanuts' },
    { difficulty: 'medium', question_text: 'Which cheese is traditionally used on a classic Caesar salad?', correct_answer: 'Parmesan', wrong_answer_1: 'Cheddar', wrong_answer_2: 'Mozzarella', wrong_answer_3: 'Feta' },
    { difficulty: 'easy', question_text: 'What fruit is dried to make raisins?', correct_answer: 'Grape', wrong_answer_1: 'Plum', wrong_answer_2: 'Cranberry', wrong_answer_3: 'Apricot' },
    { difficulty: 'medium', question_text: 'Which country is the largest producer of olive oil in the world?', correct_answer: 'Spain', wrong_answer_1: 'Italy', wrong_answer_2: 'Greece', wrong_answer_3: 'Tunisia' },
    { difficulty: 'hard', question_text: 'What is the culinary term for cutting food into thin, matchstick-like strips?', correct_answer: 'Julienne', wrong_answer_1: 'Dice', wrong_answer_2: 'Chop', wrong_answer_3: 'Mince' },
    { difficulty: 'easy', question_text: 'What is the name of the sweet substance made by bees?', correct_answer: 'Honey', wrong_answer_1: 'Maple Syrup', wrong_answer_2: 'Nectar', wrong_answer_3: 'Molasses' },
    { difficulty: 'medium', question_text: 'Which key ingredient gives pesto its green color and distinct herbal flavor?', correct_answer: 'Basil', wrong_answer_1: 'Parsley', wrong_answer_2: 'Spinach', wrong_answer_3: 'Mint' },
    { difficulty: 'hard', question_text: 'What is the name of the traditional raw fish dish marinated in citrus juice popular in Peru?', correct_answer: 'Ceviche', wrong_answer_1: 'Sashimi', wrong_answer_2: 'Tartare', wrong_answer_3: 'Carpaccio' },
    { difficulty: 'easy', question_text: 'Which popular drink is brewed from roasted and ground beans?', correct_answer: 'Coffee', wrong_answer_1: 'Tea', wrong_answer_2: 'Cocoa', wrong_answer_3: 'Cider' },
    { difficulty: 'medium', question_text: 'What is the French term for "everything in its place" in a kitchen prep context?', correct_answer: 'Mise en place', wrong_answer_1: 'Sous vide', wrong_answer_2: 'Bon appetit', wrong_answer_3: 'Chef de partie' },
    { difficulty: 'hard', question_text: 'Which nut is used to make the sweet paste called Marzipan?', correct_answer: 'Almond', wrong_answer_1: 'Pistachio', wrong_answer_2: 'Hazelnut', wrong_answer_3: 'Walnut' },
    { difficulty: 'easy', question_text: 'What is the main sweetening ingredient in maple syrup?', correct_answer: 'Sap from maple trees', wrong_answer_1: 'Sugarcane juice', wrong_answer_2: 'Beet sugar extract', wrong_answer_3: 'Corn syrup' },
    { difficulty: 'medium', question_text: 'Which type of pasta has a name that translates to "little tongues" in Italian?', correct_answer: 'Linguine', wrong_answer_1: 'Spaghetti', wrong_answer_2: 'Fettuccine', wrong_answer_3: 'Penne' },
    { difficulty: 'easy', question_text: 'What dairy product is churned from cream to make a spread?', correct_answer: 'Butter', wrong_answer_1: 'Cheese', wrong_answer_2: 'Yogurt', wrong_answer_3: 'Margarine' },
    { difficulty: 'hard', question_text: 'Which red spice is made from grinding dried sweet red bell peppers?', correct_answer: 'Paprika', wrong_answer_1: 'Cayenne Pepper', wrong_answer_2: 'Chili Powder', wrong_answer_3: 'Szechuan Pepper' },
    { difficulty: 'medium', question_text: 'What is the primary flavor of the liqueur known as Cointreau?', correct_answer: 'Orange', wrong_answer_1: 'Aniseed', wrong_answer_2: 'Coffee', wrong_answer_3: 'Almond' },
    { difficulty: 'easy', question_text: 'Which popular breakfast food is cooked on a griddle and often served with syrup?', correct_answer: 'Pancakes', wrong_answer_1: 'Toast', wrong_answer_2: 'Cereal', wrong_answer_3: 'Oatmeal' },
    { difficulty: 'medium', question_text: 'What chemical compound gives chili peppers their spicy kick?', correct_answer: 'Capsaicin', wrong_answer_1: 'Piperine', wrong_answer_2: 'Menthol', wrong_answer_3: 'Allicin' },
    { difficulty: 'hard', question_text: 'Which fungus is highly sought after by gourmands and is often hunted using trained pigs or dogs?', correct_answer: 'Truffle', wrong_answer_1: 'Morel', wrong_answer_2: 'Chanterelle', wrong_answer_3: 'Shiitake' },
    { difficulty: 'easy', question_text: 'Which carbonated beverage is traditionally flavored with vanilla and sassafras root extract?', correct_answer: 'Root Beer', wrong_answer_1: 'Ginger Ale', wrong_answer_2: 'Cola', wrong_answer_3: 'Dr Pepper' },
    { difficulty: 'medium', question_text: 'Which country is the origin of the puff pastry known as the Croissant?', correct_answer: 'Austria', wrong_answer_1: 'France', wrong_answer_2: 'Italy', wrong_answer_3: 'Germany' },
    { difficulty: 'hard', question_text: 'What type of meat is used in the traditional Greek dish Souvlaki?', correct_answer: 'Pork or Chicken', wrong_answer_1: 'Beef', wrong_answer_2: 'Lamb only', wrong_answer_3: 'Fish' },
    { difficulty: 'easy', question_text: 'What fruit is the main ingredient of cider?', correct_answer: 'Apple', wrong_answer_1: 'Pear', wrong_answer_2: 'Grape', wrong_answer_3: 'Peach' },
    { difficulty: 'medium', question_text: 'Which herb is typically associated with the flavor of jelly and sauce paired with lamb?', correct_answer: 'Mint', wrong_answer_1: 'Rosemary', wrong_answer_2: 'Thyme', wrong_answer_3: 'Oregano' }
  ];

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
    multipleStatements: true
  });

  try {
    await runMigrations(connection);

    console.log('Seeding categories and questions...');
    const { categories, questionsMap } = generateSeedData();

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
