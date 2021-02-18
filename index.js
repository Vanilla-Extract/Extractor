const fs = require('fs');
const Discord = require('discord.js');
const { prefix, verifyChannelID, verifiedRoleID, roleChannelID, roleDataChannelID } = require('./config.json');
require('dotenv').config();
const keepAlive = require('./server');
const db = require('quick.db');

// set up webhook
/*
const webhookID = process.env.webhookurl.substr(33, 18)
const webhookToken = process.env.webhookurl.substr(52, 68)
const creationsWebhook = new Discord.WebhookClient(webhookID, webhookToken)
*/

const client = new Discord.Client({ partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ] });
client.commands = new Discord.Collection();
module.exports.client = client;

for (const file of fs.readdirSync('./commands').filter((file) => file.endsWith('.js'))) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('bot running');
	client.user.setActivity('github.com/Vanilla-Extract');
});

client.on('message', (message) => {
	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	if (!client.commands.has(command)) return;

	// cooldown stuff
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}
	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;
	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing that command.`);
		}
	}
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.on('guildMemberAdd', (member) =>
	client.channels.cache
		.get('751093731171762188')
		.send(`<@${member.id}> joined the server. \`${member.guild.memberCount}\``)
);
client.on('guildMemberRemove', (member) => {
	client.channels.cache
		.get('751093731171762188')
		.send(`<@${member.id}> left the server. \`${member.guild.memberCount}\``)
	if (member.user.bot) member.roles.add(member.guild.roles.cache.find(role=>role.id=="731568194552070184")) // add bot role
	else member.roles.add(member.guild.roles.cache.find(role=>role.id=="731570521690472508")) // add member role
});

client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.message.partial) await reaction.message.fetch();
	if (reaction.partial) await reaction.fetch();
	if (!reaction.message.guild) return;
	if (reaction.message.channel.id == verifyChannelID)
		await reaction.message.guild.members.cache.get(user.id).roles.add(verifiedRoleID);
	client.channels.cache.get(roleDataChannelID).messages.fetch({ limit: 1 }).then(async (messages) => {
		const reactionsConfig = JSON.parse(messages.last().content);
		let availableReactions = [];
		for (i in reactionsConfig) {
			availableReactions.push(reactionsConfig[i].emoji);
		}
		if (reaction.message.channel.id == roleChannelID && availableReactions.includes(reaction.emoji.name)) {
			await reaction.message.guild.members.cache
				.get(user.id)
				.roles.add(reactionsConfig[availableReactions.indexOf(reaction.emoji.name)].role);
		}
	});
});

client.on('messageReactionRemove', async (reaction, user) => {
	if (reaction.message.partial) await reaction.message.fetch();
	if (reaction.partial) await reaction.fetch();
	if (!reaction.message.guild) return;
	client.channels.cache.get(roleDataChannelID).messages.fetch({ limit: 1 }).then(async (messages) => {
		const reactionsConfig = JSON.parse(messages.last().content);
		let availableReactions = [];
		for (i in reactionsConfig) {
			availableReactions.push(reactionsConfig[i].emoji);
		}
		if (reaction.message.channel.id == roleChannelID && availableReactions.includes(reaction.emoji.name)) {
			await reaction.message.guild.members.cache
				.get(user.id)
				.roles.remove(reactionsConfig[availableReactions.indexOf(reaction.emoji.name)].role);
		}
	});
});

// creations webhook
// move messages
/*
client.on("message", message => {

	if (
		message.channel.id!=process.env.creationschannelid || // the message is not in community creations
		message.author.id==client.user.id || // the message was sent my the bot
		message.attachments.array().length>0 || // there is an attachment
		message.content.includes("http://") || // there is a link
		message.content.includes("https://") // there is a link

	) return
	
	message.delete()
	message.reply(`your message was deleted because it didn't have an attachment, image or link. Please use <#${process.env.discussionchannelid}> for talking about creations posted in this channel.`).then(response=>response.delete({timeout:15000}))

	if (message.member.nickname==null) name = message.author.username
	else name = message.member.nickname

	creationsWebhook.send(message.content, { username: name, avatarURL: message.author.avatarURL({dynamic:true}) } )

})
*/
//🤔
db.set('thonks', 0);
client.on('message', (message) => {
	if (
		message.channel.id != '742137060365828127' || // the message is not in thonk
		message.author.id == client.user.id // the message was sent my the bot
	)
		return;
	if (
		message.content.toString() != '<:thonk:776478353187405825>' && //thonk in ve
		message.content.toString() != '<:stevethink:798641834288480307>' && // stevethonk in ve
		message.content.toString() != '<:thonk:776478353187405825> ' && //thonk in ve
		message.content.toString() != '<:stevethink:798641834288480307> ' // stevethonk in ve
	) {
		message.delete();
	} else {
		db.add('thonks', 1);
	}
	message.channel.setTopic(`Thonks: ${db.get('thonks')}`);
});

// picture man
require('./picasso');

keepAlive();
client.login(process.env.token);
