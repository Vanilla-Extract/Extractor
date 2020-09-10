const { prefix, color, moderatorRoleID, faqChannelID, faqDataChannelID } = require('../config.json')
const {client} = require("../index.js")

module.exports = {
    name: 'faqmanager',
    cooldown: 0,
    type: "admin",
	execute(message, args) {
        if (!message.member.roles.cache.some(role => role.id == moderatorRoleID)) message.delete().then(message.channel.send("This command is only available to moderators.").then(message=>message.delete({timeout:messageTimeout}))).catch((error)=>console.error(error))
        else {
            client.channels.cache.get(faqDataChannelID).messages.fetch({limit:1}).then(messages=>{
                let faqList = JSON.parse(messages.last().content)
                const keywordsList = faqList.map(i=>i.keyword)
                function updateFaqChannel (faqs) {
                    const faqChannel = client.channels.cache.get(faqChannelID)
                    faqChannel.bulkDelete(100)
                    for (i in faqs) {
                        const faq = faqs[i]
                        faqChannel.send({embed:{
                            "title":faq.question,
                            "description":`${faq.answer}\n\nTrigger with \`${prefix}faq ${faq.keyword}\``,
                            "color":color
                        }})
                    }
                    client.channels.cache.get(faqDataChannelID).send(JSON.stringify(faqs))
                }
                message.react("✅")
                message.author.send({embed:{"title":"FAQ Manager","description":"What would you like to do?\n🆕 Create a new question\n✏️ Edit an existing question\n❌ Delete a question","color":color}}).then(managerMenuMsg=>{
                    (async function () {
                        await managerMenuMsg.react("🆕")
                        await managerMenuMsg.react("✏️")
                        await managerMenuMsg.react("❌")
                    })().then(()=>{
                        const filter = (reaction, user) => ['🆕', '✏️','❌'].includes(reaction.emoji.name) && user.id === message.author.id
                        managerMenuMsg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(collected=>{
                            const reaction = collected.first().emoji.name

                            if (reaction=='🆕') {
                                message.author.send({embed:{"title":"Enter Keyword","description":"Enter the keyword of the question you would like to add.","color":color}}).then(keywordMessage=>{
                                    keywordMessage.channel.awaitMessages(()=>true, { max: 1, time: 60000, errors: ['time'] }).then(messageCollection=>{
                                        const newKeyword = messageCollection.array()[0].content.replace(" ","-").toLowerCase()
                                        message.author.send({embed:{"title":"Enter Question","description":"Enter the new question. You can use full markdown.","color":color}}).then(questionMessage=>{
                                            questionMessage.channel.awaitMessages(()=>true, { max: 1, time: 60000, errors: ['time'] }).then(messageCollection=>{
                                                const newQuestion = messageCollection.array()[0].content
                                                message.author.send({embed:{"title":"Enter Answer","description":"Enter the answer of the question you would like to add.","color":color}}).then(answerMessage=>{
                                                    answerMessage.channel.awaitMessages(()=>true, { max: 1, time: 60000, errors: ['time'] }).then(messageCollection=>{
                                                        const newAnswer = messageCollection.array()[0].content
                                                        updateFaqChannel(faqList.concat({"keyword":newKeyword,"question":newQuestion,"answer":newAnswer}))
                                                        message.author.send({embed:{"title":"Question Created","description":`Success!\n**K:** ${newKeyword}\n**Q:** ${newQuestion}\n**A:** ${newAnswer}`,"color":color}})
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            } else if (reaction=='✏️') {
                                message.author.send({embed:{"title":"Edit Question","description":`Enter the keyword of the question you would like to edit.\nAvailable keywords: \`${keywordsList.join("\`, \`")}\``,"color":color}}).then(()=>{
                                    managerMenuMsg.channel.awaitMessages(()=>true, { max: 1, time: 60000, errors: ['time'] }).then(keywordMessageCollection=>{
                                        const providedKeyword = keywordMessageCollection.array()[0].content
                                        if (keywordsList.includes(providedKeyword)) {
                                            const question = faqList[keywordsList.indexOf(providedKeyword)]
                                            managerMenuMsg.channel.send({embed:{"title":"Edit Question","description":`You chose this question:\n**K:** \`${providedKeyword}\`\n**Q:** ${question.question}\n**A:** ${question.answer}\n\nWhat would you like to edit? React to this message.`,"color":color}}).then(partEditMessage=>{
                                                (async function () {
                                                    await partEditMessage.react("🇰")
                                                    await partEditMessage.react("🇶")
                                                    await partEditMessage.react("🇦")
                                                })().then(()=>{
                                                    const filter = (reaction, user) => ["🇰","🇶","🇦"].includes(reaction.emoji.name) && user.id === message.author.id
                                                    partEditMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                                                    .then(collected=>{
                                                        const reaction = collected.first().emoji.name
                                                        if (reaction=="🇰") {
                                                            partEditMessage.channel.send({embed:{"title":"Edit Keyword","description":"Enter a new keyword.","color":color}}).then(()=>{
                                                                partEditMessage.channel.awaitMessages(()=>true, { max: 1, time: 60000, errors: ['time'] }).then(messageCollection=>{
                                                                    const newKeyword = messageCollection.array()[0].content.replace(" ","-").toLowerCase()
                                                                    partEditMessage.channel.send({embed:{"title":"Keyword Successfully Edited","description":`Here is the updated question:\n**K:** \`${newKeyword}\`\n**Q:** ${question.question}\n**A:** ${question.answer}`,"color":color}})
                                                                    faqList[keywordsList.indexOf(providedKeyword)].keyword = newKeyword
                                                                    updateFaqChannel(faqList)
                                                                })
                                                            })
                                                        }
                                                        else if (reaction=="🇶") {
                                                            partEditMessage.channel.send({embed:{"title":"Edit Question","description":"Enter a new question.","color":color}}).then(()=>{
                                                                partEditMessage.channel.awaitMessages(()=>true, { max: 1, time: 60000, errors: ['time'] }).then(messageCollection=>{
                                                                    const newQuestion = messageCollection.array()[0].content
                                                                    partEditMessage.channel.send({embed:{"title":"Question Successfully Edited","description":`Here is the updated question:\n**K:** \`${question.keyword}\`\n**Q:** ${newQuestion}\n**A:** ${question.answer}`,"color":color}})
                                                                    faqList[keywordsList.indexOf(providedKeyword)].question = newQuestion
                                                                    updateFaqChannel(faqList)
                                                                })
                                                            })
                                                        }
                                                        else if (reaction=="🇦") {
                                                            partEditMessage.channel.send({embed:{"title":"Edit Answer","description":"Enter a new answer. You can use full markdown.","color":color}}).then(()=>{
                                                                partEditMessage.channel.awaitMessages(()=>true, { max: 1, time: 60000, errors: ['time'] }).then(messageCollection=>{
                                                                    const newAnswer = messageCollection.array()[0].content
                                                                    partEditMessage.channel.send({embed:{"title":"Answer Successfully Edited","description":`Here is the updated question:\n**K:** \`${question.keyword}\`\n**Q:** ${question.question}\n**A:** ${newAnswer}`,"color":color}})
                                                                    faqList[keywordsList.indexOf(providedKeyword)].answer = newAnswer
                                                                    updateFaqChannel(faqList)
                                                                })
                                                            })
                                                        }
                                                    })
                                                })
                                            })
                                        } else { // the user provided a keyword that doesn't exist
                                            managerMenuMsg.channel.send({embed:{"title":"Invalid Keyword","description":`The keyword you provided (\`${providedKeyword}\`) does not exist.`,"color":color}})
                                        }
                                    })
                                })
                            } else if (reaction=='❌') {
                                message.author.send({embed:{"title":"Delete Question","description":`Enter the keyword of the question you would like to delete.\nAvailable keywords: \`${keywordsList.join("\`, \`")}\``,"color":color}}).then(getKeywordMessage=>{
                                    getKeywordMessage.channel.awaitMessages(()=>true, { max: 1, time: 60000, errors: ['time'] }).then(messageCollection=>{
                                        const providedKeyword = messageCollection.array()[0].content
                                        if (keywordsList.includes(providedKeyword)) {
                                            faqList.splice(keywordsList.indexOf(providedKeyword),1)
                                            message.author.send({embed:{"title":"Success","description":"Question deleted successfully","color":color}})
                                            updateFaqChannel(faqList)
                                        } else {
                                            message.author.send({embed:{"title":"Invalid Keyword","description":`The keyword you provided (\`${providedKeyword}\`) does not exist.`,"color":color}})
                                        }
                                    })
                                })
                            }
                        })
                    })
                    
                })
            })
        }
	}
}