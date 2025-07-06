const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    version: "1.4",
    author: "Chitron Bhattacharjee",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Hack someone's profile and send secret login 💻",
    },
    longDescription: {
      en: "Fake hack a user's profile and send their credentials (kawaii style) to Chitron 💖",
    },
    guide: {
      en: "Use: hack @mention / hack uid / reply hack / just say 'hack him'"
    },
    onChat: {
      match: /(hack( him| her| this)?|h4ck|steal login)/i,
      patternLimit: 1
    }
  },

  wrapText: async (ctx, name, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(name).width < maxWidth) return resolve([name]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = name.split(" ");
      const lines = [];
      let line = "";
      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
          else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
          line += `${words.shift()} `;
        else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  },

  onStart: async function ({ event, api, args }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    // Get Target UID
    let targetID =
      Object.keys(mentions)[0] ||
      (args[0] && /^\d+$/.test(args[0]) && args[0]) ||
      (messageReply?.senderID) ||
      senderID;

    const userInfo = await api.getUserInfo(targetID);
    const name = userInfo[targetID]?.name || "Unknown";

    // Background and avatar
    const bgURL = "https://drive.google.com/uc?id=1RwJnJTzUmwOmP3N_mZzxtp63wbvt9bLZ";
    const pathImg = path.join(__dirname, "cache", `hackbg_${targetID}.png`);
    const pathAvt = path.join(__dirname, "cache", `avt_${targetID}.png`);

    const [avt, bg] = await Promise.all([
      axios.get(`https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" }),
      axios.get(bgURL, { responseType: "arraybuffer" })
    ]);
    fs.writeFileSync(pathAvt, avt.data);
    fs.writeFileSync(pathImg, bg.data);

    const baseImage = await loadImage(pathImg);
    const baseAvt = await loadImage(pathAvt);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.font = "400 23px Arial";
    ctx.fillStyle = "#1878F3";
    ctx.textAlign = "start";

    const lines = await this.wrapText(ctx, name, 1160);
    ctx.fillText(lines.join("\n"), 200, 497);
    ctx.drawImage(baseAvt, 83, 437, 100, 101);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, buffer);
    fs.removeSync(pathAvt);

    // ✨ Fake credentials
    const username = `fb.user_${Math.floor(Math.random() * 9999)}`;
    const password = "********";
    const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const location = ["Tokyo, Japan", "Dhaka, Bangladesh", "Seoul, South Korea", "Paris, France", "Berlin, Germany"];
    const loc = location[Math.floor(Math.random() * location.length)];

    // 💌 Message to group
    await api.sendMessage({
      body: `💻✨ 𝙃𝙖𝙘𝙠 𝙄𝙣𝙞𝙩𝙞𝙖𝙩𝙚𝙙...\n🔎 𝘽𝙧𝙚𝙖𝙘𝙝𝙞𝙣𝙜 𝙛𝙞𝙧𝙚𝙬𝙖𝙡𝙡...\n📥 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙞𝙣𝙜 𝙡𝙤𝙜𝙞𝙣 𝙙𝙖𝙩𝙖...\n\n🎯 𝙏𝙖𝙧𝙜𝙚𝙩: ${name}\n📬 𝙇𝙤𝙜𝙞𝙣 𝙞𝙣𝙛𝙤 𝙨𝙚𝙣𝙩 𝙨𝙚𝙘𝙧𝙚𝙩𝙡𝙮 𝙩𝙤 𝘾𝙝𝙞𝙩𝙧𝙤𝙣 💼`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

    // 💼 Send fake credentials to you (Chitron’s DM)
    const chitronID = "100081330372098";
    await api.sendMessage({
      body: `🔐 𝙃𝙖𝙘𝙠𝙚𝙙 𝘼𝙘𝙘𝙤𝙪𝙣𝙩 𝘿𝙚𝙩𝙖𝙞𝙡𝙨:\n\n👤 𝙉𝙖𝙢𝙚: ${name}\n🧾 𝙐𝙨𝙚𝙧: ${username}\n🔑 𝙋𝙖𝙨𝙨: ${password}\n🌍 𝙄𝙋: ${ip}\n📍 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣: ${loc}`,
      attachment: fs.createReadStream(pathImg)
    }, chitronID, () => { });

  }
};
