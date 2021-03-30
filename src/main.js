const cheerio = require("cheerio")
const marked = require("marked")
const fs = require("fs-extra")
const util = require("./util")

baseSrc = fs.readFileSync(util.templateBase);

fs.removeSync(util.buildDir)
fs.copySync(util.staticDir, util.buildDir)
console.log("Cleaned build dir")

fs.readdirSync(util.docsDir).forEach((fileName) => {
    const markdown = fs.readFileSync(util.docsDir + fileName).toString()
    const content = marked(markdown)
    const $ = cheerio.load(baseSrc)
    $("#page").html(content);

    fs.writeFileSync(util.buildDir + fileName.replace(".md", ".html"), $.html());
})
