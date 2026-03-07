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

        // 1. "Managed Capture 3D" -> "3D Empyre"
        content = content.replace(/Managed Capture 3D/gi, '3D Empyre');
        // 2. "Managed Capture" -> "3D Empyre"
        content = content.replace(/Managed Capture/gi, '3D Empyre');
        // 3. "Managed3D" -> "3D Empyre" (just in case it's used as a proper noun, like Managed3D.com title)
        content = content.replace(/Managed3D/gi, '3D Empyre');

        if (content !== initial) {
            fs.writeFileSync(filepath, content, 'utf8');
            console.log('Updated ' + filepath);
        }
    } catch (e) {
        // ignore
    }
}
