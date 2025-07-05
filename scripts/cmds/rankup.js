module.exports = {
 config: {
 name: "levelup",
 aliases: ["setrank", "setlevel", "rankup", "rankdown"],
 version: "1.2",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 1,
 shortDescription: {
 en: "Set user's level (with exp sync)"
 },
 description: {
 en: "Boost or reduce user level and syncs XP with rank system"
 },
 category: "ranking",
 guide: {
 en: "{pn} @tag 10/20\n{pn} 25\n{pn} @tag -5 (to level down)"
 }
 },

 onStart: async function ({ message, event, args, usersData, envCommands }) {
 const deltaNext = envCommands["rank"]?.deltaNext || 5;

 const targetID = event.type === "message_reply"
 ? event.messageReply.senderID
 : Object.keys(event.mentions || {})[0];

 if (!targetID)
 return message.reply("❌ | Please tag or reply to a user.");

 const input = args.find(arg => !isNaN(arg) || arg.includes("/"));
 if (!input)
 return message.reply("⚠️ | Provide a level number or range (e.g. 10/20)");

 let levelChange;
 if (input.includes("/")) {
 const [min, max] = input.split("/").map(Number);
 if (isNaN(min) || isNaN(max) || min > max)
 return message.reply("❌ Invalid range.");
 levelChange = Math.floor(Math.random() * (max - min + 1)) + min;
 } else {
 levelChange = parseInt(input);
 }

 const userData = await usersData.get(targetID);
 let oldExp = userData.exp || 0;

 const oldLevel = Math.floor((1 + Math.sqrt(1 + 8 * oldExp / deltaNext)) / 2);
 const newLevel = oldLevel + levelChange;
 const newExp = Math.floor(((newLevel ** 2 - newLevel) * deltaNext) / 2);

 await usersData.set(targetID, { exp: newExp });

 return message.reply(
 `📈 𝗟𝗲𝘃𝗲𝗹 𝗨𝗽𝗱𝗮𝘁𝗲\n━━━━━━━━━━━━━━\n👤 𝗨𝘀𝗲𝗿: ${userData.name}\n🎚️ 𝗟𝗲𝘃𝗲𝗹: ${oldLevel} → ${newLevel}\n✨ 𝗘𝗫𝗣: ${oldExp} → ${newExp}`
 );
 }
};