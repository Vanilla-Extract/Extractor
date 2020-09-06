const { color, roleChannelID, roleDataChannelID } = require('../config.json')
const {client} = require("../index.js")

module.exports = {
    name: 'updaterr',
    cooldown: 5,
	execute(message, args) {
        if (message.member.roles.cache.some(role=>role.id=="751151665545085041")) {
            client.channels.cache.get(roleDataChannelID).messages.fetch({limit:1}).then(messages=>{
                const roleData = JSON.parse(messages.last().content)
                let fields = []
                for ( i in roleData ) {
                    fields.push({
                        name: roleData[i].emoji,
                        value: `<@&${roleData[i].role}>`,
                        inline: true
                    })
                }
                const embed = {
                    color: color,
                    title: "Reaction Roles",
                    description: "Want a cool role? Well today you can get one! These roles each have a special purpose so you can find out when a new pack has released for instance! Hooked? Click one of the reactions below!",
                    fields: fields
                }
                client.channels.cache.get(roleChannelID).messages.fetch({limit:1}).then(messages=>messages.last().edit({embed:embed}))
            })
        } else {
            message.channel.send ("You need moderator perms to do that.")
        }
	}
}