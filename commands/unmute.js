const { prefix, mutedRoleID, moderatorRoleID } = require("../config.json")
const {client} = require("../index")


module.exports = {
    name: "unmute",
    cooldown: 5,
	execute(message, args) {
		if (!(message.member.roles.cache.some(role => role.id==moderatorRoleID))) message.channel.send("You need to be a moderator to do that!")
		else {
			if (args[0]==undefined) message.channel.send(`You need to mention a user!\nUsage: ${prefix}unmute @User`)
			else {
				if ( args[0].startsWith("<@") && args[0].endsWith(">") ) id = args[0].substring(3, 21)
				else if ( args[0].startsWith("<@!") && args[0].endsWith(">") ) id = args[0].substring(4, 21)
				else if ( args[0].length==18 ) id = args[0]
				const member = message.guild.members.cache.get(id)
				const user = client.users.cache.get(id)
				if (member==undefined) message.channel.send(`Could not find a valid specified user.\nUsage: ${prefix}unmute @User`)
				else {
					const mutedRole = message.guild.roles.cache.get(mutedRoleID)
					member.roles.remove(mutedRole, `Manually unmuted by ${message.author.tag}`)
					message.channel.send(`Unmuted **${user.tag}**.`)
				}
			}	
		}
    }
}
