const {Transform,Writable} = require('stream');
const fs = require("fs")
const path = require("path")
const mkdirp = require('mkdirp');

// const processVue = require("./vue")

const loadFile = new Transform({
    objectMode:true,
    transform(entry, encoding, done) {
        fs.readFile(entry.path,
            'utf8',
            (e, content) => {
                entry.content = content;
                done(e, entry)
            } );
    }
});

const saveFile = new Writable({
    objectMode:true,
    write(entry, encoding, done) {
        let newBase = path.resolve(entry.cwd,entry.opts.dest);
        entry.dest = entry.path.replace(entry.base, newBase);
        console.log("modified?",entry.modified)
        console.log('saving', entry.path )
        /*
        if (entry.modified === false && entry.path === entry.dest) {
            console.log("not modified",entry.path)
            return done(null, entry);
        }
        */
       fs.writeFile(entry.dest, entry.content, done);
       /*
        mkdirp(path.dirname(entry.dest), err => {
            if (err) done(err)
            else fs.writeFile(entry.dest, entry.content, done);
        });
        */
    }
});

const saveFileOld = new Transform({
    objectMode:true,
    transform(entry, encoding, done) {
        let newBase = path.resolve(entry.cwd,entry.opts.dest);
        entry.dest = entry.path.replace(entry.base, newBase);
        console.log("modified?",entry.modified)
        console.log('saving', entry.path )
        /*
        if (entry.modified === false && entry.path === entry.dest) {
            console.log("not modified",entry.path)
            return done(null, entry);
        }
        */
        mkdirp(path.dirname(entry.dest), err => {
            if (err) done(err)
            else fs.writeFile(entry.dest, entry.content, e => {
                console.log("written ", entry.dest)
                done(e,entry)
            });
        });
    }
});


function addOptsPipe(dictionary,opts) {
    const pipe = new Transform({
        objectMode:true,
        transform(entry, encoding, done) {
            entry.opts = opts;
            entry.dictionary = dictionary
            done(null, entry)
        }
    });
    return pipe;
}

module.exports = {
    loadFile,
    addOptsPipe,
    saveFile
}
