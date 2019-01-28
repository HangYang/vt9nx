const Keys = require("../lib/keys")
const shell = require('shelljs');
const assert = require("assert");


describe("cli", () => {
    const TMP = ".tmp/keys";
    const VUES_GLOB = TMP + "/**/*.vue";
    const DICT_PATH = TMP + "/locale.json";
    before(() => {
        if (shell.test('-d', TMP)) {
            shell.rm(".tmp/keys/*")
        }
        else {
            shell.mkdir(TMP)
        }
    })
    it("#_revert", () => {
        shell.rm(".tmp/keys/*")
        shell.cp("test/fixtures/example.vue", TMP)
        Keys._revert("base.overview", "Overview", '$t',TMP + "/*.vue", console.log)
    })

    describe("removeKeys", () => {

        beforeEach(() => {
            shell.rm(".tmp/keys/*")
        });

        it("works for one", () => {
            const vueFile = TMP + "/example.vue";
            const t9nExpression = "{{ $t('base.overview') }}";
            shell.cp([
                "test/fixtures/example.vue",
                "test/fixtures/locale.json"],
                TMP)
            Keys.removeKeys(VUES_GLOB, "$t", DICT_PATH, console.log, ["base.overview"])

            assert(
                '\n' === shell.grep(t9nExpression, vueFile).stdout,
                `expected ${vueFile} to not contain t9nExpression`
            );
            assert(
                vueFile + "\n" === shell.grep("-l", "Overview", vueFile).stdout,
                `expected ${vueFile} to contain text 'Overview'`
            )
            // asert dictionary does not contain the kay
        })

        it("works for more", () => {
            const keys = ["base.overview", "base.my_cards"]
            const vals = ["Overview","My Cards"]

            shell.cp([
                "test/fixtures/example.vue",
                "test/fixtures/example1.vue",
                "test/fixtures/locale.json"],
                TMP);

            Keys.removeKeys(VUES_GLOB, "$t", DICT_PATH, console.log, keys)
            keys.forEach((k,i) => {
                let grep = shell.grep(`{{ $t('${k}') }}`, VUES_GLOB);
                assert(
                    '\n' === grep.stdout,
                    `expected ${VUES_GLOB} to not contain t9n expression but got ${grep.stdout}`
                );
                assert(
                    "\n" !== shell.grep("-l", vals[i], VUES_GLOB).stdout,
                    `expected ${VUES_GLOB} to contain text '${vals[i]}' but got ${grep.stdout}`
                )
            })

            // asert dictionary does not contain the kay
        })

    })
})