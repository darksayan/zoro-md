const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const repoUrl = 'https://github.com/darksayan/zoro-md.git';
const folderName = 'zoro-md-bot';
const repoPath = path.join(__dirname, folderName);

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
    return 'vps';
}

async function setupTermux() {
    console.log(color.cyan('[*] Termux environment detected'));

    await run('pkg', ['update', '-y']);
    await run('pkg', ['install', '-y', 'nodejs-lts', 'git', 'python', 'make', 'clang']);
}

async function setupVPS() {
    console.log(color.cyan('[*] VPS environment detected'));

    await run('sudo', ['apt', 'update', '-y']);
    await run('sudo', ['apt', 'install', '-y',
        'git',
        'curl',
        'build-essential',
        'python3',
        'ffmpeg',
        'libcairo2-dev',
        'libpango1.0-dev',
        'libjpeg-dev',
        'libgif-dev',
        'librsvg2-dev'
    ]);

    await run('bash', ['-c', 'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -']);
    await run('sudo', ['apt', 'install', '-y', 'nodejs']);
}

function patchPackage(env) {
    const pkgFile = path.join(repoPath, 'package.json');
    if (!fs.existsSync(pkgFile)) return;

    let pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));

    if (env === 'termux') {
        const removeList = ['canvas', 'sharp', 'ffmpeg-static', 'cpu-features'];

        removeList.forEach(dep => {
            if (pkg.dependencies?.[dep]) delete pkg.dependencies[dep];
            if (pkg.optionalDependencies?.[dep]) delete pkg.optionalDependencies[dep];
        });

        console.log(color.yellow('[!] Removed heavy modules for Termux'));
    } else {
        console.log(color.green('[✓] Keeping full modules for VPS'));
    }

    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
}

function patchFile() {
    const file = path.join(repoPath, 'node_modules', '@sabir7718', 'log', 'index.js');
    if (!fs.existsSync(file)) return;

    let lines = fs.readFileSync(file, 'utf-8').split('\n');
    if (lines.length >= 51) {
        lines[50] = '';
        fs.writeFileSync(file, lines.join('\n'));
        console.log(color.green('[✓] Patched log file'));
    }
}

async function installDeps() {
    console.log(color.cyan('[*] Installing dependencies...'));

    let code = await run('npm', ['install'], repoPath);

    if (code !== 0) {
        console.log(color.yellow('[!] Retry install 1'));
        code = await run('npm', ['install', '--force'], repoPath);
    }

    if (code !== 0) {
        console.log(color.yellow('[!] Retry install 2'));
        code = await run('npm', ['install', '--legacy-peer-deps'], repoPath);
    }

    if (code !== 0) {
        console.log(color.red('[✗] Install failed, continuing anyway'));
    } else {
        console.log(color.green('[✓] Dependencies installed'));
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

async function startBot() {
    console.log(color.green('[✓] Starting bot...'));

    while (true) {
        let code = await run('npm', ['start'], repoPath);

        if (code !== 0) {
            console.log(color.red('[!] Crash detected, restarting in 5s...'));
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

async function main() {
    console.log(color.cyan('=== UNIVERSAL AUTO SETUP ==='));

    const env = detectEnv();

    if (env === 'termux') {
        await setupTermux();
    } else {
        await setupVPS();
    }

    await cloneOrUpdate();
    patchPackage(env);
    await installDeps();
    patchFile();
    await startBot();
}

main();