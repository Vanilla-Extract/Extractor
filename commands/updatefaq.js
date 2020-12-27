const { prefix, color, moderatorRoleID, faqChannelID } = require('../config.json')
const { client } = require("../index.js")
const readFaq = require("../readfaq")

module.exports = {
    name: 'updatefaq',
    cooldown: 0,
    type: "admin",
	execute(message, args) {
        if (!message.member.roles.cache.some(role => role.id == moderatorRoleID)) message.channel.send("This command is only available to moderators.")
        else {

            const faqList = readFaq()

            const faqChannel = client.channels.cache.get(faqChannelID)

            faqChannel.bulkDelete(100)
            for (faq of faqList) {
                faqChannel.send({embed:{
                    "title": faq.question,
                    "description": `${faq.answer}\n\nTrigger with \`${prefix}faq ${faq.keyword}\``,
                    "color": color
                }})
            }
        }
	}
}