import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const root = path.dirname(__filename);

const dirsToScan = ['src', 'public', 'index.html', 'README.md', 'CLAUDE.md'];

function walk(dir, callback) {
    const stat = fs.statSync(dir);
    if (stat.isFile()) {
        callback(dir);
        return;
    }
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walk(filepath, callback);
        } else {
            callback(filepath);
        }
    }
}

dirsToScan.forEach(dir => {
    const fullPath = path.join(root, dir);
    if (fs.existsSync(fullPath)) walk(fullPath, processFile);
});

function processFile(filepath) {
    if (filepath.endsWith('.png') || filepath.endsWith('.jpg') || filepath.endsWith('.ico')) return; // skip binary

    try {
        let content = fs.readFileSync(filepath, 'utf8');
        let initial = content;

        content = content.replace(/3D Empyre\.com/gi, '3dempyre.com');

        if (content !== initial) {
            fs.writeFileSync(filepath, content, 'utf8');
            console.log('Fixed URL in ' + filepath);
        }
    } catch (e) {
        // ignore
    }
}
