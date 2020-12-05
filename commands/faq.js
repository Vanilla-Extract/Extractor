const { prefix, color, messageTimeout, faqDataChannelID } = require('../config.json')
const {client, faqDatabase} = require("../index.js")

module.exports = {
    name: 'faq',
    cooldown: 5,
	execute(message, args) {
        if (args[0]==undefined) message.channel.send(`You need to provide a keyword. Usage: \`${prefix}faq [keyword]\``)
        else {
            const specifiedKeyword = args[0].toLowerCase()
            client.channels.cache.get(faqDataChannelID).messages.fetch({limit:1}).then(messages=>{
                const faqList = JSON.parse(messages.last().content)
                const keywordsList = faqList.map(i=>i.keyword)
                if (keywordsList.includes(specifiedKeyword)) {
                    const faq = faqList[keywordsList.indexOf(specifiedKeyword)]
                    message.channel.send({embed:{"title":faq.question,"description":faq.answer,"color":color}})
                }
                else message.channel.send(`That keyword was invalid. Usage: \`${prefix}faq [keyword]\``).then(message=>message.delete({timeout:messageTimeout}))
            })
        }
	}
}