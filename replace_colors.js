const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.html') && !filePath.endsWith('.css')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace various linear-gradient formats with var(--theme-gradient)
    content = content.replace(/linear-gradient\s*\(\s*135deg\s*,\s*(#FF6B00|#4A00E0)\s*,\s*(#FF8C00|#FF6B00)\s*\)/ig, 'var(--theme-gradient)');
    // Specifically target the #4A00E0 to #FF6B00 and #FF6B00 to #FF8C00 gradients even with different spacing
    content = content.replace(/linear-gradient\s*\(\s*135deg\s*,\s*#4A00E0\s*,\s*#FF6B00\s*\)/ig, 'var(--theme-gradient)');
    content = content.replace(/linear-gradient\s*\(\s*135deg\s*,\s*#FF6B00\s*,\s*#FF8C00\s*\)/ig, 'var(--theme-gradient)');
    content = content.replace(/linear-gradient\s*\(\s*135deg\s*,\s*#1a3a5c\s*,\s*#FF8C00\s*\)/ig, 'var(--theme-gradient)');
    
    // Replace standalone primary color occurrences in CSS/style blocks (except within var(--primary-color) definitions)
    if(filePath.endsWith('.css')) {
       // Replace #FF6B00 globally in css with var(--primary-color) unless it's the declaration itself
       content = content.replace(/(?<!--primary-color:\s*)#FF6B00/ig, 'var(--primary-color)');
       // The secondary color as well
       content = content.replace(/(?<!--secondary-color:\s*)#4A00E0/ig, 'var(--secondary-color)');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
}

walkDir('.', processFile);
