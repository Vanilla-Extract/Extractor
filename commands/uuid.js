const { color } = require('../config.json');

module.exports = {
	name: 'uuid',
	description: 'Generates an uuid',
	cooldown: '0',
	execute(client, message, args, Discord, cmd) {
		if (args[0] && (isNaN(args[0]) || (args[0] != '1' && args[0] != '4')))
			return message.channel.send(`You must specify a valid version for the uuid.\nValid Versions: 1, 4`);
		const version = args[0] || 4;
		let id;
		if (version == '1') {
			id = uuid.v1();
		} else {
			id = uuid.v4();
		}

		return message.channel.send(
			new Discord.MessageEmbed()
				.setColor(config.colors.defualt)
				.setTitle(`UUID v${version}`)
				.setDescription(`\`${id}\``)
		);
	}
};
