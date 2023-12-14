/**
  * Created by Riy
  * WhatsApp wa.me/6281575886399
  * Follow me on Instagram @riycoders
*/

"use strict";
const {
	default: makeWASocket,
	BufferJSON,
	initInMemoryKeyStore,
	DisconnectReason,
	AnyMessageContent,
    makeInMemoryStore,
	useMultiFileAuthState,
	delay
} = require("@whiskeysockets/baileys")
const figlet = require("figlet");
const fs = require("fs");
const moment = require('moment')
const chalk = require('chalk')
const path = require('path')
const logg = require('pino')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif2')
const clui = require('clui')
const { Spinner } = clui
const { serialize, getBuffer } = require("./lib/myfunc");
const { color, mylog, infolog } = require("./lib/color");
const time = moment(new Date()).format('HH:mm:ss DD/MM/YYYY')
let setting = JSON.parse(fs.readFileSync('./config.json'));
let session = `./${setting.sessionName}.json`
let welcome = JSON.parse(fs.readFileSync('./database/welcome.json'));

const rentfrom = async (XeonBotInc, m, from) => {
const { sendImage, sendMessage } = XeonBotInc;
const { reply, sender } = m;
const store = makeInMemoryStore({ logger: logg().child({ level: 'fatal', stream: 'store' }) })

async function dStart() {
	const { state, saveCreds } = await useMultiFileAuthState('./database/rent_bot_vanz')
	const conn = makeWASocket({
            printQRInTerminal: true,
            logger: logg({ level: 'fatal' }),
            auth: state,
            browser: ["VanzBot By Daf", "Safari", "4.0"],
	    getMessage: async key => {
              return {
                
              }
          }
        })
	title()
        store.bind(conn.ev)
	
	/* Auto Update */
	require('./message/help')
	require('./lib/myfunc')
	require('./message/msg')
	nocache('./message/help', module => console.log(chalk.whiteBright('vanz >') + chalk.greenBright(' [WABOT]') + chalk.cyanBright(` "${module}" Telah diupdate!!! `) + time ))
	nocache('./lib/myfunc', module => console.log(chalk.whiteBright('vanz >') + chalk.greenBright(' [WABOT]') + chalk.cyanBright(` "${module}" Telah diupdate!!! `) + time ))
	nocache('./message/msg', module => console.log(chalk.whiteBright('vanz >') + chalk.greenBright(' [WABOT]') + chalk.cyanBright(` "${module}" Telah diupdate!!! `) + time ))
	
	conn.multi = true
	conn.nopref = false
	conn.prefa = 'anjing'
	conn.mode = 'public'
	conn.ev.on('messages.upsert', async m => {
		if (!m.messages) return;
		var msg = m.messages[0]
		msg = serialize(conn, msg)
		msg.isBaileys = msg.key.id.startsWith('BAE5') || msg.key.id.startsWith('3EB0')
		require('./message/msg')(conn, msg, m, setting, store, welcome)
	})
	conn.ev.on('connection.update', (update) => {
          if (global.qr !== update.qr) {
           global.qr = update.qr
          }
          const { connection, lastDisconnect } = update
            if (connection === 'close') {
                lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? connectToWhatsApp() : console.log('sepertinya kamu harus menghapus sesi dan scan ulang qr whatsapp')
            }
        })
	conn.ev.on('creds.update', await saveCreds)
	
        conn.ev.on('group-participants.update', async (data) => {
          const isWelcome = welcome.includes(data.id) ? true : false
          if (isWelcome) {
            try {
              for (let i of data.participants) {
                try {
                  var pp_user = await conn.profilePictureUrl(i, 'image')
                } catch {
                  var pp_user = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg'
                }
                if (data.action == "add") {
          conn.sendMessage(data.id, { image: { url: pp_user }, caption: `Welcome @${i.split("@")[0]}`, mentions: [i] })
                } else if (data.action == "remove") {
                  conn.sendMessage(data.id, { image: { url: pp_user }, caption: `AKHIRNYA BEBAN GRUP KELUAR
Sayonara @${i.split("@")[0]}`, mentions: [i] })
                     }
                   }
                 } catch (e) {
                   console.log(e)
                 }
               }
             })
             
    conn.sendImageAsSticker = async (from, path, msg, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await conn.sendMessage(from, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted: msg
        })
        return buffer
    }
    conn.sendVideoAsSticker = async (from, path, msg, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await conn.sendMessage(from, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted: msg
        })
        return buffer
    }
    conn.getName = (from, withoutContact = false) => {
        id = conn.decodeJid(from)
        withoutContact = conn.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = conn.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === conn.decodeJid(conn.user.id) ?
            conn.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    conn.sendContact = async (from, creatorNumber, msg = '', opts = {}) => {
	       let list = []
	       for (let i of creatorNumber) {
	           list.push({
	    	          displayName: await conn.getName(i + '@s.whatsapp.net'),
	    	          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i)}\nFN:${await conn.getName(i)}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:creator@vanzdev.xyz\nitem2.X-ABLabel:Email\nitem3.URL:https://profile.Vanzdev.xyz\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	          })
	       }
	       conn.sendMessage(from, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted: msg })
    }    
    conn.sendTextWithMentions = async (from, text, msg, options = {}) => conn.sendMessage(from, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
    }, {
        quoted: msg
    })   

	conn.reply = (from, content, msg) => conn.sendMessage(from, { text: content }, { quoted: msg })

	return conn
}

dStart()
