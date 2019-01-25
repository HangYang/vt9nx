```
npx vt9nx -s "{{i18n(" -e ")}}" -f "src/**/*.vue" -o "./outdir"
```

or
```
npm install -g vt9nx
vt9nx -s "{{i18n(" -e ")}}" -f "src/**/*.vue" -o "./outdir"
```

```
Options:
  -f, --files [src]    source (glob pattern)
  -o, --output [dir]   output dir
  -s, --start [start]  t9n expression start. default {{i18n(
  -e, --end [end]      t9n expression end. default )}}
  -h, --help           output usage information
```