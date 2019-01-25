const Transform = require('stream').Transform;
const fs = require("fs")
const path = require("path")
const mkdirp = require('mkdirp');

const processVue = require("./vue")

const loadFile = new Transform({
    objectMode:true,
    transform(entry, encoding, done) {
        console.log(entry.path)
        fs.readFile(entry.path,
            'utf8',
            (e, content) => {
                entry.content = content;
                done(e, entry)
            } );
    }
});

const saveFile = new Transform({
    objectMode:true,
    transform(entry, encoding, done) {
        const newBase = path.resolve(entry.cwd,entry.opts.dest);
        entry.dest = entry.path.replace(entry.base, newBase);
        mkdirp(path.dirname(entry.dest), err => {
            if (err) done(err)
            else fs.writeFile(entry.dest, entry.content, done);
        });
    }
});

function dictMaker(dict) {
    return new Transform({
        objectMode:true,
        transform(entry, encoding, done) {
            dict[entry.path] = entry.dict;
            done(null,entry)
        }
    });
}

function addOptsPipe(opts={
    expStart:"{{_(",
    expEnd:")}}",
    dest:"output"
}) {
    const pipe = new Transform({
        objectMode:true,
        transform(entry, encoding, done) {
            entry.opts = opts;
            done(null, entry)
        }
    });
    return pipe;
}

const extract = new Transform({
    objectMode:true,
    transform(entry,encoding,done) {
        const {content,dict} = processVue(entry.content, entry.opts);
        entry.content = content;
        entry.dict = dict
        done(null, entry);
    }
})


module.exports = {
    loadFile,
    addOptsPipe,
    saveFile,
    extract,
    dictMaker
}
