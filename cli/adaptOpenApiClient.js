/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

// Get the file path from the command line arguments
const inputFile = process.argv[2];

if (!inputFile) {
  console.error('Please provide a file path as a command line argument.');
  process.exit(1);
}

// Read the content of the file
fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Define the regex patterns to search for and their corresponding replacements
  const patterns = [
    { pattern: '.string().regex(/^0x[a-fA-F0-9]{40}$/)', replacement: '.address()' },
    { pattern: '.string().regex(/^0x[a-f0-9]*$/)', replacement: '.positiveHexString()' },
  ];

  // Replace each pattern in the file content
  patterns.forEach(({ pattern, replacement }) => {
    // eslint-disable-next-line no-param-reassign
    data = data.replaceAll(pattern, replacement);
  });

  // Write the modified content back to the file
  fs.writeFile(inputFile, data, 'utf8', err => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File successfully modified!');
  });
});
