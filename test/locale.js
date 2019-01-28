const dictionary = require("../lib/dictionary");
const assert = require("assert");
const _ = require("lodash");
const BidiMap = require('bidi-map');
const crypto = require("crypto");

describe("dict", () => {


    describe("#load", () => {

        it("returns a bidi map of flatten locale file", () => {
            const dict = dictionary.load(__dirname + "/fixtures/locale.json");
            assert(dict instanceof BidiMap, "dic instanceof BidiMap");
            assert(dict.has("sales.direct_sale"), "dict.has(sales.direct_sale)");
        })

    })


    it("#unflatten", () => {
        const map = new BidiMap([
            ['a.a1', 'x'],
            ['a.a2', 'y'],
            ['b', 'z'],
            ['c.c1', 'f']
        ])
        const obj = dictionary.unflatten(map);
        assert(_.isEqual(obj, { a: { a1: 'x', a2: 'y' }, b: 'z', c: { c1: 'f' } }), 'objects should match')
    })


    it("#writeFile", () => {
        const map = new BidiMap([
            ['a.a1', 'x'],
            ['a.a2', 'y'],
            ['b', 'z'],
            ['c.c1', 'f']
        ]);
        return dictionary.writeFile(map,'.tmp/en.json')
    })

})