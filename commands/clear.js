const { prefix, moderatorRoleID, messageTimeout } = require('../config.json')

module.exports = {
    name: 'clear',
    cooldown: 0,
    type: "admin",
	execute(message, args) {
        if (!message.member.roles.cache.some(role => role.id == moderatorRoleID)) message.delete().then(message.channel.send("This command is only available to moderators.").then(message=>message.delete({timeout:messageTimeout}))).catch((error)=>console.error(error))
        else if (args[0]==undefined) message.delete().then(message.channel.send("You need to specify how many messages you want to delete.").then(message=>message.delete({timeout:messageTimeout}))).catch((error)=>console.error(error))
        else message.channel.bulkDelete(Number(args[0])+1).then(message.channel.send(`🚫 Deleted ${args[0]} messages.`).then(message=>message.delete({timeout:messageTimeout}))).catch((error)=>console.error(error))
	}
}