const cheerio = require("cheerio")
const marked = require("marked")
const fs = require("fs-extra")
const util = require("./util")

const titleRegex = /^#(.+)/m;
baseSrc = fs.readFileSync(util.templateBase);

fs.removeSync(util.buildDir)
fs.copySync(util.staticDir, util.buildDir)
console.log("Cleaned build dir")

fs.readdirSync(util.docsDir).forEach((fileName) => {
    const markdown = fs.readFileSync(util.docsDir + fileName).toString()
    const content = marked(markdown)
    const $ = cheerio.load(baseSrc)

    let title = "Odense Pride"
    const  titleMatch = markdown.match(titleRegex);
    if (titleMatch !== null && titleMatch.length >= 2) {
        title = titleMatch[1].trim()
    }
    $("#page").html(content);
    const description = $("#page p:first-of-type").text();

    const head = $("head");

    head.append($(`<meta property="og:title" content="${title}"/>`));
    head.append($(`<meta property="og:type" content="article" />`));
    head.append($(`<meta property="og:description" content="${description}"/>`));
    head.append($(`<title>${title}</title>`));


    fs.writeFileSync(util.buildDir + fileName.replace(".md", ".html"), $.html());
})
