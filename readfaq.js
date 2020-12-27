const fs = require("fs")

module.exports = () => {

	let faqList = []
	const faqString = fs.readFileSync("./faq.md", {encoding:"utf-8"})
	const regex = /## (.+)$\r?\nKeyword: `(\w+)`\s*$\r?\n((?:.|\r?\n(?!\s*## ))*)/gm
	
	let match = regex.exec(faqString)

	while (match) {
		faqList.push({
			"question": match[1].trim(),
			"keyword": match[2],
			"answer": match[3].trim()
		}) 
		match = regex.exec(faqString)
	}

	return faqList
}

console.log(module.exports())