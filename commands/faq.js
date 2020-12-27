const { prefix, color, messageTimeout, faqDataChannelID } = require('../config.json')
const {client} = require("../index.js")
const readFaq = require("../readfaq")


module.exports = {
    name: 'faq',
    cooldown: 0,
	execute(message, args) {
        if (args[0]==undefined) message.channel.send(`You need to provide a keyword. Usage: \`${prefix}faq [keyword]\``)
        else {
            readFaq().then(faqList => {

                const specifiedKeyword = args[0].toLowerCase()
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