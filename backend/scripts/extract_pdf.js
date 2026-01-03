const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = '/Users/sahanaagadi/Webtech_CEER/DOC-20251219-WA0002..pdf';

if (!fs.existsSync(pdfPath)) {
    console.error(`Error: File not found at ${pdfPath}`);
    process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function (data) {
    console.log('--- START OF TEXT ---');
    console.log(data.text);
    console.log('--- END OF TEXT ---');
    console.log('Number of pages:', data.numpages);
}).catch(err => {
    console.error('Error parsing PDF:', err);
});
