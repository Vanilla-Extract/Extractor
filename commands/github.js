module.exports = {
    name: "github",
    cooldown: 5,
	execute(message, args) {
        message.channel.send({embed:{
            title: "GitHub Organisation",
            description: "You can find a link to the GitHub organisation [here](https://github.com/Vanilla-Extract)."
        }})
    }
}