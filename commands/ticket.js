const { prefix, color } = require('../config.json')

module.exports = {
    name: 'ticket',
    cooldown: 5,
	execute(message, args) {
        message.delete().then(()=>{
            message.channel.send({embed:{
                "title": "Rules Of A Ticket",
                "fields": [
                    {
                        "name": ":one:",
                        "value": "Wait *patiently*! There will be times when you won't get an immediate response!"
                    },
                    {
                        "name": ":two:",
                        "value": "Don't ask to ask, just ask."
                    },
                    {
                        "name": ":three:",
                        "value": "Don't wait for us! Just say what you want with the format below:\n\nWhat you need help with\nWhats supposed to happen\nWhat happens instead\nAdditional thoughts\n\nExample: My dirt texture isn't working! It's supposed to look like this: <image> but ends up using the default one!"
                    }
                ]
            }})
        })
    }
}