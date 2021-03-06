const { client } = require("./index")
const { prefix } = require("./config.json")

const Discord = require("discord.js")
const scalePixelArt = require("scale-pixel-art")
const request = require("request").defaults({ encoding: null })


client.on("message", message => {
	
	if (
		!message.content.startsWith(`${prefix}scale`) ||
		message.author.bot
	) return
	
	if (message.reference) scaleAndSend ( message.referencedMessage.attachments.first(), message.channel )
	else inputAttachment = scaleAndSend (message.attachments.first(), message.channel )
	
})


const scaleAndSend = (inputAttachment, channel) => {

	if (inputAttachment==undefined) {
		
		channel.send('There was no attachment on that message.\nUse \`!scale\` in a message with an image, or reply to an image with `\!scale`\ to scale it.')
		return
	}

	const inputAttachmentURL = inputAttachment.url

	request.get(inputAttachmentURL, (err, res, inputBuffer) => {
		
		scalePixelArt(inputBuffer, 20)
			.then(outputBuffer => {
				const outputAttachment = new Discord.MessageAttachment(outputBuffer, "response.png")
				if (Buffer.byteLength(outputBuffer) <= 8000000) {
					channel.send(outputAttachment)
						.catch(error => channel.send(`Sending the scaled image failed for the following reason:\n\`${error}\``))
				} else channel.send("Could not send the scaled image because the file size was too big.")
			})
			.catch(error => channel.send(`Scaling the image failed for the following reason:\n\`${error}\``))
		
	})
	
}
