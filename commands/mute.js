const { prefix, mutedRoleID, moderatorRoleID } = require("../config.json")
const {client} = require("../index")


module.exports = {
    name: "mute",
    cooldown: 5,
	execute(message, args) {
		if (!(message.member.roles.cache.some(role => role.id==moderatorRoleID))) message.channel.send("You need to be a moderator to do that!")
		else {
			if (args[0]==undefined) message.channel.send(`You need to mention a user!\nUsage: ${prefix}mute @User [time in hours]`)
			else {
				if ( args[0].startsWith("<@") && args[0].endsWith(">") ) id = args[0].substring(3, 21)
				else if ( args[0].startsWith("<@!") && args[0].endsWith(">") ) id = args[0].substring(4, 21)
				else if ( args[0].length==18 ) id = args[0]
				const member = message.guild.members.cache.get(id)
				const user = client.users.cache.get(id)
				if (member==undefined) message.channel.send(`Could not find a valid specified user.\nUsage: ${prefix}mute @User [time in hours]`)
				else {
					const mutedRole = message.guild.roles.cache.get(mutedRoleID)
					if (!isNaN(args[1])) {
						duration = parseFloat(args[1])
						member.roles.add(mutedRole, `Muted by ${message.author.tag} for ${duration} hours`)
						message.channel.send(`Muted **${user.tag}** for ${duration} hours.`)
						setTimeout ( () => {
							member.roles.remove(mutedRole, `Unmuted automatically after ${duration} hours. Originally muted by ${message.author.tag}`)
						}, duration*3600000)
					} else {
						member.roles.add(mutedRole, `Muted indefinitely by ${message.author.tag}`)
						message.channel.send(`Muted **${user.tag}** indefinitely.`)
					}
				}
			}	
		}
    }
}
