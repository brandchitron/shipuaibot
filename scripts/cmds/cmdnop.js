const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const kawaiiStyle = (msg) => `🎀 𝑪𝑴𝑫 𝑪𝒉𝒖𝒖~ 🎀\n${msg}`;

module.exports = {
	config: {
		name: "cmdmatch",
		version: "2.1",
		author: "Chitron Bhattacharjee",
		countDown: 1,
		role: 2,
		shortDescription: { en: "Install inline or attachment commands" },
		description: { en: "Install/load .js command from code, attachment or url" },
		category: "owner",
		guide: {
			en: `Say:
+cmd <raw code>
+cmd install (with .js/.txt attachment)
+cmd load <file>
+cmd unload <file>`
		}
	},

	onChat: async function ({ message, event, api, utils, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData }) {
		const body = event.body || "";
		const prefix = utils.getPrefix(event.threadID) || global.GoatBot.config.prefix || "+";
		if (!body.toLowerCase().startsWith(prefix + "cmd")) return;

		const raw = body.slice(prefix.length).trim();
		const args = raw.split(" ");
		const commandBody = raw.toLowerCase();
		const { attachments } = event;
		const { loadScripts } = global.utils;

		// 🌸 CMD INSTALL from Attachment
		if (args[1]?.toLowerCase() === "install" && attachments?.length) {
			const file = attachments[0];
			const ext = (file.name || "").split(".").pop().toLowerCase();
			if (!["js", "txt"].includes(ext)) {
				return message.reply(kawaiiStyle(`⚠️ 𝑷𝒍𝒆𝒂𝒔𝒆 𝒔𝒆𝒏𝒅 𝒂 .𝒋𝒔 𝒐𝒓 .𝒕𝒙𝒕 𝒇𝒊𝒍𝒆!`));
			}

			message.reply(kawaiiStyle(`📩 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅𝒊𝒏𝒈 𝒂𝒕𝒕𝒂𝒄𝒉𝒎𝒆𝒏𝒕...`));

			try {
				const res = await axios.get(file.url);
				const rawCode = res.data;
				const nameMatch = rawCode.match(/config\s*:\s*{[^}]*name\s*:\s*["'`](.+?)["'`]/s);
				if (!nameMatch) return message.reply(kawaiiStyle(`❌ 𝑪𝒐𝒖𝒍𝒅𝒏'𝒕 𝒇𝒊𝒏𝒅 𝒄𝒐𝒏𝒇𝒊𝒈.𝒏𝒂𝒎𝒆 😿`));

				const commandName = nameMatch[1].trim();
				const filename = `${commandName}.js`;

				message.reply(kawaiiStyle(`🧩 𝑰𝒏𝒔𝒕𝒂𝒍𝒍𝒊𝒏𝒈 「${commandName}」 𝒇𝒓𝒐𝒎 𝒇𝒊𝒍𝒆...`));

				const result = loadScripts("cmds", commandName, global.utils.log, global.GoatBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, rawCode);

				if (result.status === "success") {
					return message.reply(kawaiiStyle(`✅ 𝑺𝒖𝒄𝒄𝒆𝒔𝒔! 「${commandName}」 𝒊𝒔 𝒓𝒆𝒂𝒅𝒚~ 🍡`));
				} else {
					return message.reply(kawaiiStyle(`❌ 𝑬𝒓𝒓𝒐𝒓 𝒍𝒐𝒂𝒅𝒊𝒏𝒈 「${commandName}」:\n${result.error.name}: ${result.error.message}`));
				}
			} catch (e) {
				return message.reply(kawaiiStyle(`❌ 𝑭𝒂𝒊𝒍𝒆𝒅 𝒕𝒐 𝒓𝒆𝒂𝒅 𝒇𝒊𝒍𝒆~ 😿`));
			}
		}

		// 🧠 CMD <RAW CODE>
		if (args.length >= 2 && !["load", "unload", "install", "loadall"].includes(args[1])) {
			const rawCode = body.slice(prefix.length + 4).trim();
			const nameMatch = rawCode.match(/config\s*:\s*{[^}]*name\s*:\s*["'`](.+?)["'`]/s);
			if (!nameMatch) {
				return message.reply(kawaiiStyle(`❌ 𝑪𝒐𝒖𝒍𝒅𝒏'𝒕 𝒇𝒊𝒏𝒅 𝒄𝒐𝒏𝒇𝒊𝒈.𝒏𝒂𝒎𝒆 😿`));
			}
			const commandName = nameMatch[1].trim();

			message.reply(kawaiiStyle(`📥 𝑨𝒖𝒕𝒐-𝒅𝒆𝒕𝒆𝒄𝒕: 「${commandName}」 💖\n🧩 𝑳𝒐𝒂𝒅𝒊𝒏𝒈...`));

			const result = loadScripts("cmds", commandName, global.utils.log, global.GoatBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, rawCode);

			if (result.status === "success") {
				return message.reply(kawaiiStyle(`✅ 𝑺𝒖𝒄𝒄𝒆𝒔𝒔! 「${commandName}」 𝒊𝒔 𝒓𝒆𝒂𝒅𝒚~ 🍡`));
			} else {
				return message.reply(kawaiiStyle(`❌ 𝑬𝒓𝒓𝒐𝒓:\n${result.error.name}: ${result.error.message}`));
			}
		}
	},

	onStart: async () => {}
};
