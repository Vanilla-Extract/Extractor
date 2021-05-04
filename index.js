const fs = require('fs');
const Discord = require('discord.js');
const {
	prefix,
	verifyChannelID,
	verifiedRoleID,
	roleChannelID,
	roleDataChannelID,
	starboardChannelID
} = require('./config.json');
require('dotenv').config();
const keepAlive = require('./server');
const db = require('quick.db');
var starboard = new db.table('starboard');

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

// for starboard
const starTypes = [ [ '0', '⭐' ], [ '5', '🌟' ], [ '10', '💫' ], [ '20', '✨' ] ];
// ['amount needed', 'emoji']

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
			return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing that command.`);
		}
	}
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}
});
client.on('guildMemberAdd', (member) => {
	client.channels.cache
		.get('751093731171762188')
		.send(`<@${member.id}> joined the server. \`${member.guild.memberCount}\``);
	if (member.user.bot)
		member.roles.add(member.guild.roles.cache.find((role) => role.id == '731568194552070184')); // add bot role
	else member.roles.add(member.guild.roles.cache.find((role) => role.id == '731570521690472508')); // add member role
});
client.on('guildMemberRemove', (member) =>
	client.channels.cache
		.get('751093731171762188')
		.send(`<@${member.id}> left the server. \`${member.guild.memberCount}\``)
);
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

	const message = reaction.message;
	// const msgs = starboardChannel.messages.fetch({ limit: 100 });
	const starboardChannel = client.channels.cache.find((c) => c.id == starboardChannelID);
	const sentMessage = starboard.get(message.id);

	let starType;
	starTypes.forEach((star) => {
		if (reaction.count >= star[0]) starType = star[1];
	});

	// console.log(sentMessage);
	// msgs.find((m) => (m.embeds.length === 1 ? (msg.embeds[0].footer.text == message.id ? true : false) : false));
	if (reaction.emoji.name == '⭐' && reaction.count >= 3) {
		// console.log('das a lot');
		let embed = new Discord.MessageEmbed()
			.setColor('#FAA944')
			.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
			.setDescription(message.cleanContent)
			.addField('Jump To Message', `[Click Here](${message.url})`, true);
		// console.log(message);
		if (message.attachments.size > 0) {
			message.attachments.map((a) => embed.setImage(a.url));
		}
		if (sentMessage == null) {
			let msg;
			await starboardChannel
				.send(`${starType} **${reaction.count}** - <#${message.channel.id}>`, {
					embed: embed
				})
				.then(async (message) => (msg = await starboardChannel.messages.fetch(message.id)));
			// console.log(msg);
			starboard.set(message.id, { originalMessage: message, starboardMessage: msg });
		} else {
			const oldMessage = await starboardChannel.messages.fetch(starboard.get(message.id).starboardMessage[0].id);
			// console.log(oldMessage.embeds);
			// console.log(starboard.get(message.id).starboardMessage);
			console.log(reaction);
			let newMessage = {
				content: `${starType} **${reaction.count}** - <#${message.channel.id}>`,
				embed: oldMessage.embeds[0]
			};
			await oldMessage.edit(newMessage);
			// console.log('done - increase');
		}
	}
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

	const message = reaction.message;
	// const msgs = starboardChannel.messages.fetch({ limit: 100 });
	const starboardChannel = client.channels.cache.find((c) => c.id == starboardChannelID);
	// const sentMessage = starboard.get(message.id);
	let starType;
	starTypes.forEach((star) => {
		if (reaction.count >= star[0]) starType = star[1];
	});

	if (reaction.emoji.name == '⭐' && reaction.count >= 1) {
		// console.log('das a lot');

		const oldMessage = await starboardChannel.messages.fetch(starboard.get(message.id).starboardMessage[0].id);
		// console.log(oldMessage.embeds);
		// console.log(starboard.get(message.id).starboardMessage);
		// console.log(reaction);
		let newMessage = {
			content: `${starType} **${reaction.count}** - <#${message.channel.id}>`,
			embed: oldMessage.embeds[0]
		};
		await oldMessage.edit(newMessage);
		// console.log('done - decrease');
	}
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
	message.reply(`Your message was deleted because it didn't have an attachment, image or link. Please use <#${process.env.discussionchannelid}> for talking about creations posted in this channel.`).then(response=>response.delete({timeout:15000}))

	if (message.member.nickname==null) name = message.author.username
	else name = message.member.nickname

	creationsWebhook.send(message.content, { username: name, avatarURL: message.author.avatarURL({dynamic:true}) } )

})
*/

require('./picasso');

keepAlive();
client.login(process.env.token);
