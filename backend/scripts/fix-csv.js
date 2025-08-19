const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'csv file', 'Tu Vung N5.csv');

// Read the file
let content = fs.readFileSync(csvPath, 'utf8');

// Split into lines
const lines = content.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  if (i === 0) {
    // Header line
    fixedLines.push(line);
    continue;
  }
  
  // Split by comma, but we need to handle the case where meaning column has commas
  const parts = line.split(',');
  
  if (parts.length === 5) {
    // Normal case: Kanji,Hiragana,Meaning,Category,JLPT
    fixedLines.push(line);
  } else if (parts.length > 5) {
    // Case where meaning has commas - need to quote it
    const kanji = parts[0];
    const hiragana = parts[1];
    // Rejoin the meaning parts (all middle parts except last 2)
    const meaningParts = parts.slice(2, parts.length - 2);
    const meaning = meaningParts.join(',');
    const category = parts[parts.length - 2];
    const jlpt = parts[parts.length - 1];
    
    const fixedLine = `${kanji},${hiragana},"${meaning}",${category},${jlpt}`;
    fixedLines.push(fixedLine);
    console.log(`Fixed line ${i + 1}: ${line} -> ${fixedLine}`);
  } else {
    // Less than 5 parts, might be malformed
    console.log(`Warning: Line ${i + 1} has ${parts.length} parts: ${line}`);
    fixedLines.push(line);
  }
}

// Write back to file
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(csvPath, fixedContent, 'utf8');

console.log(`✅ Fixed CSV file: ${csvPath}`);
console.log(`📊 Total lines processed: ${lines.length}`);
console.log(`📊 Fixed lines written: ${fixedLines.length}`);