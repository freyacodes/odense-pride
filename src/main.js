const cheerio = require("cheerio")
const marked = require("marked")
const fs = require("fs-extra")
const util = require("./util")

const titleRegex = /^#(.+)/m;

fs.removeSync(util.buildDir)
fs.copySync(util.staticDir, util.buildDir)
console.log("Cleaned build dir")

const files = {
    da: {},
    en: {}
}

// Discover files
fs.readdirSync(util.docsDir).forEach((fileName) => {
    const lang = fileName.endsWith(".en.md") ? "en" : "da";
    const name = fileName.replace(".en.md", "").replace(".md", "");
    files[lang][name] = {
        name: name,
        fileName: fileName,
        lang: lang
    };
});

// Discover missing English pages
const englishNames = Object.keys(files.en)
const untranslated = Object.keys(files.da).filter((s) => englishNames.indexOf(s) < 0)
untranslated.forEach((name) => {
    files.en[name] = Object.assign({}, files.da[name])
})

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
    for (let num in files[lang]) {
        if (!files[lang].hasOwnProperty(num)) continue
        const page = files[lang][num]

        const fileName = page.fileName
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

        if (lang !== page.lang) {
            $("#page").prepend($(`<div class="translation-warning">This page has not been translated</div>`))
        }

        let html = $.html()
            .replace(/%PATH%/g, page.name)
            .replace(/%MD_LANG%/g, page.lang)

        fs.writeFileSync(langBuildDir + page.name + ".html", html);
    }
}

generateSite("da", "en")
generateSite("en", "da")
