const fs = require('fs');

const commandFiles = fs.readdirSync('./commands/').filter((file) => file.endsWith('.js'));

module.exports = {
	name: 'help',
	description: 'Lists Commands',
	aliaes: [ 'commands', 'cmd', 'cmds', 'command' ],
	execute(client, message, args, Discord) {
		var cmdList = [];

		for (const file of commandFiles) {
			const command = require(`../commands/${file}`);
			if (command.name && command.description) {
				cmdList.push(command.name);
				cmdList.push(command.description);
			} else {
				continue;
			}
		}

		const responseEmbed = new Discord.MessageEmbed().setColor('#7289da').setTitle('Commands for actual bot');

		for (var i = 0; i < cmdList.length; i = i + 2) {
			responseEmbed.addFields({ name: cmdList[i], value: cmdList[i + 1] });
		}

		message.channel.send(responseEmbed);
	}
};
