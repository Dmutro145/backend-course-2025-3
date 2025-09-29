import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

// Налаштування параметрів командного рядка
program
  .requiredOption('-i, --input <path>', 'Input JSON file path')
  .option('-o, --output <path>', 'Output file path')
  .option('-d, --display', 'Display result in console')
  .option('--date', 'Display date before flight information')
  .option('-a, --airtime <minutes>', 'Filter by minimum air time in minutes', parseInt);

program.parse(process.argv);
const options = program.opts();

// Перевірка обов'язкового параметра
if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// Перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

try {
  console.log('Reading file:', options.input);
  const data = fs.readFileSync(options.input, 'utf8');
  console.log('File size:', data.length, 'characters');
  
  const lines = data.trim().split('\n');
  console.log('Number of lines:', lines.length);
  
  let result = '';
  let processedCount = 0;
  
  // Обробка кожного рядка
  for (const line of lines) {
    if (!line.trim()) continue; // Пропускаємо порожні рядки
    
    try {
      const flight = JSON.parse(line);
      
      // Фільтрація за часом у повітрі (якщо задано параметр -a)
      if (options.airtime && flight.AIR_TIME <= options.airtime) {
        continue; // Пропускаємо запис
      }
      
      let outputLine = '';
      
      // Додавання дати (якщо задано параметр --date)
      if (options.date && flight.FL_DATE) {
        outputLine += flight.FL_DATE + ' ';
      }
      
      // Додавання часу у повітрі та відстані
      if (flight.AIR_TIME !== undefined && flight.DISTANCE !== undefined) {
        outputLine += flight.AIR_TIME + ' ' + flight.DISTANCE;
      }
      
      if (outputLine) {
        result += outputLine + '\n';
        processedCount++;
      }
    } catch (parseError) {
      // Пропускаємо пошкоджені рядки
      continue;
    }
  }
  
  console.log('Processed records:', processedCount);
  
  // Вивід результатів у консоль (якщо задано -d)
  if (options.display) {
    console.log(result.trim());
  }
  
  // Збереження у файл (якщо задано -o)
  if (options.output) {
    fs.writeFileSync(options.output, result.trim());
    console.log('Results saved to:', options.output);
  }
  
} catch (error) {
  console.error('Error processing file:', error.message);
  process.exit(1);
}