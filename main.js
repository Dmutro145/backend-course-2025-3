import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

program
  .option('-i, --input <path>', 'шлях до файлу для читання (JSON)')
  .option('-o, --output <path>', 'шлях до файлу для запису результату')
  .option('-d, --display', 'вивести результат у консоль')
  .option('--date', 'відображати дату перед інформацією')
  .option('-a, --airtime <minutes>', 'фільтр за мінімальним часом у повітрі', parseInt);

program.parse(process.argv);
const options = program.opts();

// Наша власна перевірка обов'язкового параметра з точним текстом
if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// Перевірка існування файлу з точним текстом помилки
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

try {
  const data = fs.readFileSync(options.input, 'utf8');
  const lines = data.trim().split('\n');
  
  let result = '';
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      const flight = JSON.parse(line);
      
      if (options.airtime && flight.AIR_TIME <= options.airtime) {
        continue;
      }
      
      let outputLine = '';
      
      if (options.date && flight.FL_DATE) {
        outputLine += flight.FL_DATE + ' ';
      }
      
      if (flight.AIR_TIME !== undefined && flight.DISTANCE !== undefined) {
        outputLine += flight.AIR_TIME + ' ' + flight.DISTANCE;
      }
      
      if (outputLine) {
        result += outputLine + '\n';
      }
    } catch (parseError) {
      continue;
    }
  }
  
  if (options.display) {
    console.log(result.trim());
  }
  
  if (options.output) {
    fs.writeFileSync(options.output, result.trim());
  }
  
} catch (error) {
  console.error('Error processing file:', error.message);
  process.exit(1);
}