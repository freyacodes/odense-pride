const cheerio = require("cheerio")
const marked = require("marked")
const fs = require("fs-extra")
const util = require("./util")

const titleRegex = /^#(.+)/m;

fs.removeSync(util.buildDir)
fs.copySync(util.staticDir, util.buildDir)
console.log("Cleaned build dir")

function generateSite(lang, otherLang) {
    let baseSrc = fs.readFileSync(util.templateBase)
        .toString()
        .replace(/%LANG%/g, lang)
        .replace(/%OTHER_LANG%/g, otherLang)

    if (lang === "en") {
        baseSrc = baseSrc.replace("Priden", "The Pride")
            .replace("Vedtægter", "Articles of Association")
            .replace("Bestyrelsen", "The Board")
            .replace("Historie", "History")
    }

    const langBuildDir = util.buildDir + "/" + lang + "/";
    fs.mkdirpSync(langBuildDir);
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

        fs.writeFileSync(langBuildDir + fileName.replace(".md", ".html"), $.html());
    })
}

generateSite("da", "en")
generateSite("en", "da")
