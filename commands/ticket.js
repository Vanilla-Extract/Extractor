const { color } = require('../config.json')

module.exports = {
    name: 'ticket',
    cooldown: 5,
	execute(message, args) {
        message.channel.send({embed:{
            "color": color,
            "title": "Rules Of A Ticket",
            "description": `1. Wait *patiently*! There will be times when you won't get an immediate response!
2. Don't ask to ask, just ask.
3. The team *helps* with your pack, not make them for you!
4. Don't wait for us! Just say what you want with the format below:

What you need help with
Whats supposed to happen
What happens instead
Additional thoughts

Example: My dirt texture isn't working! It's supposed to look like this: <image> but ends up using the default one!`
        }})
    }
}