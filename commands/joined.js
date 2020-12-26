const { prefix, color } = require('../config.json')

module.exports = {
    name: 'joined',
    cooldown: 5,
	execute(message, args) {
        if (args[0]==undefined) message.channel.send(`Usage \`${prefix}joined [id]\`\nHow to get a user's id: https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-`)
        else {
            try {
                const member = message.guild.members.cache.get(args[0])
                message.channel.send(`\`${member.user.tag}\` joined at \`${member.joinedAt.toUTCString()}\`.`)
            } catch ( error ) {
                message.reply("There was error trying to do that. Are you sure you entered a valid ID?\nhttps://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-")
            }
        }
    }
}
