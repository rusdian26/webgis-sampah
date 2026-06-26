import fs from 'fs';
import path from 'path';

const dirToRename = path.join(process.cwd(), 'src/pages/transporter');
const newDir = path.join(process.cwd(), 'src/pages/courier');

// Rename directory
if (fs.existsSync(dirToRename)) {
  fs.renameSync(dirToRename, newDir);
  console.log('Renamed folder transporter to courier');
}

// Rename files inside courier dir
if (fs.existsSync(newDir)) {
  const files = fs.readdirSync(newDir);
  for (const file of files) {
    if (file.toLowerCase().includes('transporter')) {
      const newFile = file.replace(/Transporter/g, 'Courier').replace(/transporter/g, 'courier');
      fs.renameSync(path.join(newDir, file), path.join(newDir, newFile));
      console.log(`Renamed ${file} to ${newFile}`);
    }
  }
}

// Recursively find and replace in src folder
function findAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const newContent = content
        .replace(/Transporter/g, 'Courier')
        .replace(/transporter/g, 'courier')
        .replace(/TRANSPORTER/g, 'COURIER')
        .replace(/Driver/g, 'Courier')
        .replace(/driver/g, 'courier');
        
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated content in ${fullPath}`);
      }
    }
  }
}

findAndReplace(path.join(process.cwd(), 'src'));
console.log("Done renaming contents");
