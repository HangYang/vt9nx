- extracts text from vue templates
- outputs templates with text replaced with translation expressions
- outputs ``en.json`` with all translatable expressions keyed by hash:

# Usage

```
Usage: vt9nx [options]

Options:
  -f, --files [src]    source (glob pattern)
  -o, --output [dir]   output dir
  -s, --start [start]  t9n expression start. ex: {{i18n(
  -e, --end [end]      t9n expression end. ex: )}}
  -h, --help           output usage information
```

**Given:**
```
./src
    /file1.vue
    /file2.vue

# file1.vue
<template>
    <p>
        some text
    </p>
</template>
...
```

**Doing:**
```
npx vt9nx -s "{{i18n(" -e ")}}" -f "src/**/*.vue" -o "./outdir"
# or
npm install -g vt9nx
vt9nx -s "{{i18n(" -e ")}}" -f "src/**/*.vue" -o "./outdir"
```

**Generates:**
```
./outdir
    /file1.vue
    /file2.vue
    /en.json

# en.json
{
    "/path/to/output/file1.vue": {
        "ce8ae9da5b7cd6c3df2929543a9af92d": "some text",
        ...
    },
     "/path/to/output/file2.vue": {
        ...
    }
}
# file1.vue
<template>
    <p>{{i18n( "ce8ae9da5b7cd6c3df2929543a9af92d" )}}</p>
</template>
```

