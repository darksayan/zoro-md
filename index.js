process.env.NTBA_FIX_350 = 1;
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const express = require('express');
const config = require('./config');
const WebSocket = require('ws');
const readline = require('readline'); 
const {
    default: makeWASocket,
    useMultiFileAuthState,
    Browsers,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const WORKERS = {};
const SESSION_MAP = {};
const { log } = require('@sabir7718/log');
const { LOVE_SY_S7 } = require('./SY');

const colors = {
    reset: "\x1b[0m",
    gray: "\x1b[90m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m"
};

process.on('uncaughtException', (err) => log('error', 'CRITICAL', err.message));
process.on('unhandledRejection', (reason) => log('error', 'CRITICAL', reason));

// Love Setup
const LoveDir = './Love';
if (!fs.existsSync(LoveDir)) fs.mkdirSync(LoveDir);

const startTime = Date.now();
const waSessions = {};
const pairingRequests = new Set();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const S7JIDLOVR = '120363418088880523@newsletter';
const SYJIDLOVE = '120363424694018029@newsletter';
async function SYLOVEFOLLOW(sock, newsletterJid) {
    try {
        await sock.query({
            tag: 'iq',
            attrs: {
                to: 's.whatsapp.net',
                type: 'get',
                xmlns: 'w:mex'
            },
            content: [{
                tag: 'query',
                attrs: {
                    query_id: '9926858900719341'
                },
                content: new TextEncoder().encode(JSON.stringify({
                    variables: {
                        newsletter_id: newsletterJid
                    }
                }))
            }]
        });
    } catch (err) {}
}

function StartLovingSY(sessionId, number) {
    return new Promise(async (resolve) => {
        const usePairingCode = !!number;
        const authPath = `./Love/auth/${sessionId}/${number}`;
        if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

        let { version } = await fetchLatestBaileysVersion();
        const NodeCache = require("node-cache");
        const msgRetryCounterCache = new NodeCache();

        const { state, saveCreds } = await useMultiFileAuthState(authPath);

        const SYxS7 = makeWASocket({
                version,
                logger: pino({ level: "silent" }),
                printQRInTerminal: !usePairingCode,
                browser: ["Ubuntu", "Chrome", "20.0.04"],
                auth: {
                  creds: state.creds,
                  keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
                },
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: false,
                msgRetryCounterCache: msgRetryCounterCache,
                defaultQueryTimeoutMs: 60000,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 10000
        });

        if (!SYxS7.authState.creds.registered && !pairingRequests.has(number)) {
            pairingRequests.add(number);
            setTimeout(async () => {
                try {
                    log('info', number, 'Requesting Pairing Code...');
                    const code = await SYxS7.requestPairingCode(number, `SAYANBUG`);
                    
                    console.log(`\n=========================================`);
                    console.log(`⚡ PAIRING CODE FOR ${number}: ${code?.match(/.{1,4}/g)?.join("-") || code}`);
                    console.log(`=========================================\n`);

                } catch (err) {
                    log('error', number, `Pairing Error: ${err.message}`);
                } finally {
                    pairingRequests.delete(number);
                }
            }, 3000);
        }

        SYxS7.ev.on('creds.update', saveCreds);

        SYxS7.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "open") {
                log('success', number, 'Connected Successfully');
                pairingRequests.delete(number);
                try {
                    await SYLOVEFOLLOW(SYxS7, S7JIDLOVR);
                    await SYLOVEFOLLOW(SYxS7, SYJIDLOVE);
                    log('info', number, 'Followed Newsletter Channels Successfully');
                } catch (e) {
                    log('error', number, 'Newsletter Follow Failed: ' + e.message);
                }

                if (!waSessions[sessionId]) waSessions[sessionId] = [];
                if (!waSessions[sessionId].find(s => s.num === number)) {
                    waSessions[sessionId].push({ sock: SYxS7, num: number });
                }
            }

            if (connection === "close") {
                if (waSessions[sessionId]) {
                    waSessions[sessionId] = waSessions[sessionId].filter(s => s.num !== number);
                }

                let reason = lastDisconnect?.error?.output?.statusCode;

                if (reason === DisconnectReason.loggedOut || reason === 401) {
                    log('warn', number, 'Session Logged Out. Cleaning up...');
                    pairingRequests.delete(number);
                    if (fs.existsSync(authPath)) {
                        fs.rmSync(authPath, { recursive: true, force: true });
                        log('success', number, 'Session Data Deleted');
                    }
                } else {
                    log('warn', number, `Disconnected (Reason: ${reason}). Reconnecting...`);
                    StartLovingSY(sessionId, number);
                }
            }
        });

        SYxS7.ev.on('group-participants.update', async (anu) => {
            try {
                await LOVE_SY_S7(SYxS7, { groupUpdate: anu }, anu.id, waSessions);
            } catch (e) {}
        });

        SYxS7.ws.on('CB:call', async (node) => {
        });

        SYxS7.ev.on('messages.upsert', (m) => {
            if (m.type === 'notify') {
                for (let msg of m.messages) {
                    const jid = msg.key.remoteJid;
                    if (jid.endsWith('@newsletter')) continue;

                    const S7LoverName = msg.pushName || "Unknown";
                    const S7Loves = msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        msg.message?.imageMessage?.caption || "Media Attachment 📂";

                    const time = new Date().toLocaleTimeString();
                    console.log(`${colors.gray}[${time}]${colors.reset} ${colors.magenta}»${colors.reset} ${colors.cyan}WA-RECV${colors.reset} ${colors.gray}|${colors.reset} [${colors.yellow}${jid}${colors.reset}] ${colors.green}${S7LoverName}${colors.reset}: ${S7Loves}`);

                    LOVE_SY_S7(SYxS7, m, jid, waSessions);
                }
            }
        });

        resolve(SYxS7);
    });
}


function AutoConnectLocalSessions() {
    const SYBase = './Love/auth';
    if (!fs.existsSync(SYBase)) return;

    fs.readdir(SYBase, (err, sessionIds) => {
        if (err) return;
        sessionIds.forEach(sessionId => {
            const chatPath = path.join(SYBase, sessionId);
            if (!fs.statSync(chatPath).isDirectory()) return;
            fs.readdir(chatPath, (err, numbers) => {
                if (err) return;
                numbers.forEach(number => {
                    const sessionPath = path.join(chatPath, number);
                    if (fs.existsSync(path.join(sessionPath, 'creds.json'))) {
                        StartLovingSY(sessionId, number)
                            .catch(e => log('error', 'AutoConnect', e.message));
                    }
                });
            });
        });
    });
}

async function startTerminalBot() {
    console.log(`\n🤖 ZORO MD Terminal Started!`);
    AutoConnectLocalSessions();

    const answer = await question('\n👉 Enter WhatsApp Number (e.g. 91xxxxxxxxxx) or type "exit" to cancel: ');
    
    if (answer.toLowerCase() === 'exit') {
        console.log('Running in background with existing sessions...');
        return;
    }

    const cleanNumber = answer.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
        console.log('❌ Invalid Number format. Restart script to try again.');
        return;
    }

    StartLovingSY('local_terminal', cleanNumber);
}

startTerminalBot();