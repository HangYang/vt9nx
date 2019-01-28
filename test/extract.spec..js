const Subject = require("../lib/extract")
const fs = require("fs")
const assert = require("assert");
const BidiMap = require("bidi-map");
const subject = Subject({
    info:console.log
})
describe("lib/vue.js", () => {

    describe("_getPrefix", () => {
        it("returns prefix", () => {
            const prefix = subject._getPrefix("./where/src/views/homeView.vue")
            assert(prefix === "views.home_view.", "expected views.home_view got " + prefix)
        })
        it("returns prefix", () => {
            const prefix = subject._getPrefix("src/views/homeView.vue")
            assert(prefix === "views.home_view.", "expected views.home_view got " + prefix)
        })
        it("returns prefix", () => {
            const prefix = subject._getPrefix("some/where/homeView.vue")
            assert(prefix === "home_view.", "expected home_view got " + prefix)
        })
    });

    describe("processVue", () => {
        let content;
        let dict;
        before((done) => {
            dict = new BidiMap();
            fs.readFile(
                __dirname + "/fixtures/example.vue",
                "utf8",
                (err, data) => {
                    content = data;
                    done(err)
                });
        })

        it.only("works", () => {
            const opts = {
                translationFunc: "$t"
            }
            const prefix = "views.example.";
            const out = subject.processVue(content, prefix, dict, opts);
            /*
            //console.log(out.content);
            ['some_text',
                'text_with_spaces',
                'text_before_br',
                'text_after_br'
            ].forEach(str => {
                let key = prefix + str;
                let exp = `{{ $t("${key}") }}`;
                assert(out.dict.has(key), "expected dict to contain " + key);
                assert(out.content.indexOf(exp) >= 0, "expected content to contain " + exp)
            });
            */
            console.log(out.content);
            console.log(dict.entries())
        })
    })

    describe("extract",function() {
        this.timeout(0);

        it("workz", () => {
            const log = {
                info: console.log
            }
            return subject.extract(".tmp/src/**/*.vue","$t",".tmp/src/locales/en.json",".tmp/src")
                .then(() => console.log("finish"))
        })
    })
})