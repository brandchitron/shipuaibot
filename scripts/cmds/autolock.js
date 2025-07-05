const mongoose = require("mongoose");
const os = require("os");

const instanceSchema = new mongoose.Schema({
	activeInstanceId: String,
	updatedAt: Date
});
const Instance = mongoose.models["instancelock"] || mongoose.model("instancelock", instanceSchema);

const myInstanceId = `${os.hostname()}-${process.pid}`;

module.exports = {
	config: {
		name: "autolock",
		version: "1.0",
		author: "Chitron Bhattacharjee",
		countDown: 5,
		role: 2,
		shortDescription: {
			en: "Kill duplicate bot instances"
		},
		description: {
			en: "Prevents the same bot ID running in multiple environments"
		},
		category: "system",
		guide: {
			en: "Auto runs on load. No command needed."
		}
	},

	onStart: async function () {
		try {
			const existing = await Instance.findOne({});
			if (existing && existing.activeInstanceId !== myInstanceId) {
				console.log(`🛑 Another instance is already running (${existing.activeInstanceId})`);
				return process.exit(0);
			}

			await Instance.updateOne(
				{},
				{ activeInstanceId: myInstanceId, updatedAt: new Date() },
				{ upsert: true }
			);

			console.log(`✅ This instance (${myInstanceId}) is now the active bot.`);
		} catch (err) {
			console.error("❌ Instance lock error:", err);
			process.exit(1);
		}
	}
};