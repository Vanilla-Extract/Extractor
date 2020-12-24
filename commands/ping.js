module.exports = {
	name: 'ping',
	cooldown: 0.001,
	execute(message, args) {
		message.channel.send(`:ping_pong: Pong! The game lasted ${Date.now() - message.createdTimestamp}ms.`);
	}
};
