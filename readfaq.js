const fs = require("fs")
const request = require("request")

module.exports = async () => {

	const regex = /## (.+)$\r?\nKeyword: `(\w+)`\s*$\r?\n((?:.|\r?\n(?!\s*## ))*)/gm
	var faqList = []

	await new Promise ( (resolve, reject) => {

		request("https://raw.githubusercontent.com/Vanilla-Extract/Extractor/master/faq.md", (err, res, body) => {
			if (err) reject(err)
			else {
				
				let match = regex.exec(body)
			
				while (match) {
					faqList.push({
						"question": match[1].trim(),
						"keyword": match[2],
						"answer": match[3].trim()
					}) 
					match = regex.exec(body)
				}
				
				resolve(faqList)

			}
		})
	})

	return faqList
}
