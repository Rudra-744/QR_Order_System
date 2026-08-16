const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/ASUS/Desktop/Rudra/QR_Order_System/frontend2/src/components';

function bumpFontsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Bump font sizes by 1
    content = content.replace(/fontSize:\s*(\d+)/g, (match, p1) => {
        let size = parseInt(p1, 10);
        // Only bump standard small sizes
        if (size >= 9 && size <= 20) {
            size += 1;
        }
        return `fontSize: ${size}`;
    });

    // Bump font weights up
    content = content.replace(/fontWeight:\s*(\d+)/g, (match, p1) => {
        let weight = parseInt(p1, 10);
        if (weight === 400) weight = 500;
        else if (weight === 500) weight = 600;
        else if (weight === 600) weight = 700;
        else if (weight === 700) weight = 800;
        else if (weight === 800) weight = 900;
        return `fontWeight: ${weight}`;
    });

    fs.writeFileSync(filePath, content);
}

function traverseDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const fullPath = path.join(currentDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            bumpFontsInFile(fullPath);
            console.log('Bumped fonts in:', fullPath);
        }
    }
}

traverseDir(dir);
console.log("Done bumping fonts!");
