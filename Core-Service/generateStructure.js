const fs = require('fs');
const path = require('path');

const basePath = __dirname;
const gitignorePath = path.join(basePath, '.gitignore');

// Read .gitignore
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
const gitignorePatterns = gitignoreContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

// Add additional patterns to always exclude
gitignorePatterns.push('.git', 'dist', '.idea');

// Convert gitignore patterns to regex
function patternToRegex(pattern) {
    pattern = pattern.replace(/^\/?/, '').replace(/\/$/, '');
    pattern = pattern.replace(/\./g, '\\.');
    pattern = pattern.replace(/\*/g, '.*');
    return new RegExp(`^${pattern}($|/)`);
}

const regexPatterns = gitignorePatterns.map(patternToRegex);

function shouldIgnore(relativePath) {
    return regexPatterns.some(regex => regex.test(relativePath));
}

function walk(dir, prefix = '') {
    const items = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

        if (shouldIgnore(relativePath)) {
            continue;
        }

        const icon = entry.isDirectory() ? '📁' : '📄';
        items.push(`${prefix}${icon} ${entry.name}`);

        if (entry.isDirectory()) {
            const subItems = walk(fullPath, prefix + '  ');
            items.push(...subItems);
        }
    }

    return items;
}

const output = [];
output.push('# Quick-Bite Core Service - Project Structure');
output.push('');
output.push('## Navigation Tree');
output.push('');
output.push(...walk(basePath));

const outputPath = path.join(basePath, 'PROJECT_STRUCTURE.md');
fs.writeFileSync(outputPath, output.join('\n'), 'utf-8');

console.log(`✓ Project structure generated: PROJECT_STRUCTURE.md`);
console.log(`✓ Total items shown: ${output.length - 4}`);

