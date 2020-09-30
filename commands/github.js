module.exports = {
    name: "github",
    cooldown: 5,
	execute(message, args) {
        message.delete().then(()=>message.channel.send("Find a link to the GitHub repository here: https://github.com/Vanilla-Extract/VanillaExtract"))
    }
}