module.exports = {
 config: {
 name: "shutdown", // Unique command name
 version: "1.0",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 2, // Owner only
 shortDescription: {
 en: "Shutdown the bot safely"
 },
 description: {
 en: "Stops the bot process safely on command by the owner."
 },
 category: "owner",
 guide: {
 en: "Use +shutdown to stop the bot."
 }
 },

 langs: {
 en: {
 confirm: "⚠️ Shutting down the bot safely... Bye! 👋",
 noPermission: "❌ You do not have permission to use this command."
 }
 },

 onStart: async function({ api, event, role, getLang, message }) {
 if (role < 2) return message.reply(getLang("noPermission"));

 await message.reply(getLang("confirm"));

 // Give the reply time to send before exit
 setTimeout(() => {
 process.exit(0); // Exit the node process to shut down the bot
 }, 1500);
 }
};