const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const repoUrl = 'https://github.com/darksayan/zoro-md.git';
const folderName = 'zoro-md-bot';
const repoPath = path.join(__dirname, folderName);

function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd, stdio: 'inherit', shell: true });
        
        child.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Command failed with exit code: ${code}`));
            }
            resolve();
        });
        
        child.on('error', reject);
    });
}

function editTargetFile() {
    const filePath = path.join(repoPath, 'node_modules', '@sabir7718', 'log', 'index.js');
    
    if (fs.existsSync(filePath)) {
        let lines = fs.readFileSync(filePath, 'utf-8').split('\n');
        if (lines.length >= 51) {
            lines[50] = '';
            fs.writeFileSync(filePath, lines.join('\n'));
        }
    }
}

async function main() {
    try {
        if (!fs.existsSync(repoPath)) {
            console.log('[+] Starting new setup, cloning repository...');
            await runCommand('git', ['clone', repoUrl, folderName], __dirname);
            console.log('[+] Installing dependencies...');
            await runCommand('npm', ['install', '--force'], repoPath);
        } else {
            console.log('[+] Folder already exists, checking for GitHub updates...');
            await runCommand('git', ['pull'], repoPath);
        }

        editTargetFile();
        console.log('[+] Target file edited successfully');

        console.log('[+] Starting app...');
        await runCommand('npm', ['start'], repoPath);
        
    } catch (error) {
        console.error('[-] Process Error:', error.message);
    }
}

main();
