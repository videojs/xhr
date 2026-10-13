#!/usr/bin/env node
var http = require("http")
var path = require("path")
var Readable = require("stream").Readable
var browserify = require("browserify")
var chromium = require("playwright-core").chromium
var mockServer = require("./mock-server.js")

var testFile = path.resolve(process.argv[2])
var serveOnly = process.argv.indexOf("--serve") !== -1
var timeout = 60000

var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tests</title>' +
    '<link rel="icon" href="data:,"></head>' +
    '<body><pre id="output"></pre><script>' +
    'var log = console.log; console.log = function () {' +
    'document.getElementById("output").textContent += Array.prototype.join.call(arguments, " ") + "\\n";' +
    'return log.apply(console, arguments) }' +
    '</script><script src="/tests-bundle.js"></script></body></html>'

function bundle(callback) {
    var b = browserify({ debug: true })
    b.add(Readable.from(['require("tape").onFinish(function () { window.__tapeFinished = true })']), {
        basedir: __dirname,
        file: path.join(__dirname, "finish-hook.js")
    })
    b.add(testFile)
    b.bundle(callback)
}

function handler(req, res) {
    if (req.url === "/") {
        res.setHeader("Content-Type", "text/html")
        return res.end(html)
    }
    if (req.url === "/tests-bundle.js") {
        return bundle(function(err, src) {
            if (err) {
                console.error(err.stack || err)
                res.statusCode = 500
                return res.end()
            }
            res.setHeader("Content-Type", "application/javascript")
            res.end(src)
        })
    }
    if (req.url.substr(0, 5) === "/mock") {
        return mockServer(req, res)
    }
    res.statusCode = 404
    res.end()
}

async function run(url) {
    var errors = 0
    var asserts = 0
    var failures = 0
    var browser = await chromium.launch(process.env.CHROME_BIN ?
        { executablePath: process.env.CHROME_BIN } :
        { channel: "chrome" })

    try {
        var page = await browser.newPage()

        page.on("console", function(msg) {
            var text = msg.text()

            if (msg.type() !== "log") {
                return console.error(text)
            }
            if (/^ok \d+/.test(text)) {
                asserts++
            } else if (/^not ok \d+/.test(text)) {
                asserts++
                failures++
            }
            console.log(text)
        })
        page.on("pageerror", function(err) {
            console.error(err.stack || err)
        })

        await page.goto(url)
        await page.waitForFunction("window.__tapeFinished === true", null, { timeout: timeout })
    } catch (err) {
        errors++
        console.error(err.stack || err)
    } finally {
        await browser.close()
    }

    return errors === 0 && failures === 0 && asserts > 0
}

var server = http.createServer(handler)

server.listen(0, async function() {
    var url = "http://localhost:" + server.address().port + "/"

    if (serveOnly) {
        return console.log("Open " + url + " in a browser to run the tests")
    }

    var passed = await run(url)

    server.close()
    process.exit(passed ? 0 : 1)
})
