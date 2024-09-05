/* eslint-disable no-console */
import fs from 'fs';
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
    // discriminatedUnion doesn't work well with z.lazy definitions.
    // As `union` provides some functionality (but less performance effective)
    // we fall back to it to avoid problems.
    // If you want to dig deeper:
    // - https://stackoverflow.com/a/78212619
    // - https://github.com/colinhacks/zod#recursive-types
    // - https://github.com/colinhacks/zod#discriminated-unions
    { pattern: ".discriminatedUnion('kind', ", replacement: '.union(' },
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
