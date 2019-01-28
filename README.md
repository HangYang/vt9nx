# Vue t9n eXtract

- extracts text from vue templates
- outputs templates with text replaced by translation expressions
- outputs ``en.json`` with all translatable expressions

# Keys
- prefix is `path.to.vue_file` relative to folder `src` (if applicable)
- plus the text chopped to maximum 5 words in `snake_case`. key uniqueness is enforced by adding a number at the end if same key exists but with diffrent content

# translatable text
- only template content is supported


# Usage

```
USAGE

     vt9nx <command> [options]

   COMMANDS

     extract                      replace strings with translation expressions add them to dictionay
     chkey <oldKey> <newKey>      change a translation string's key
     help <command>               Display help for a specific command


     vt9nx extract

   OPTIONS

     -l, --local [dictionay-path]      <lan>.json path    optional      default: "src/locales/en.json"
     -s, --src  [files]                source             optional      default: "src/**/*.vue"
     -d, --dest [output-dir]           output dir         optional      default: "src"
     -t, --func [translation-fn]       t9n function       optional      default: "$t"

```

### Given:

**src/views/myView.vue**
```
<template>
<div>
    <label for="state">Price (USD)</label>
    <strong class="js-tpl-litteral">{{`js tpl litteral ${domething * 100} times`}}</strong>
    <span class="simple">some text</span>
    <div class="indented">
      text with spaces
    </div>
    <p class="duplicate">text with spaces/p>
    <div class="another-binding">{{daysRemaining}} days left</div>
    <p class="br">
      text before br
      <br>
      text after br
    </p> 
    <p class="long multiline">
      Long text Lorem Ipsum is simply dummy 
      text of the printing and typesetting industry. 
    </p>
    <section class="long-same-start">
      Long text Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
      diffrent end
    </section>
  </div>
</template>
<script>...</script>
...
```

### Doing:
```sh
$ npx vt9nx extract
# or
$ npm install -g vt9nx
$ vt9nx extract
```

### Results in:
**src/locales/en.json**
```json
{
    "views": {
        "my_view": {
            "price_usd": "Price (USD)"
        }
    }
}
```
***src/views/myView.vue
```html
<template>
  <div>
    <label for="state">{{ $t('views.my_view.price_usd') }}</label>
    <strong class="js-tpl-litteral">{{ $t('views.example.js_tpl_litteral_domething', {domething100:domething * 100}) }}</strong>
    <span class="simple">{{ $t('views.my_view.some_text') }}</span>
    <div class="indented">
      {{ $t('views.my_view.text_with_spaces') }}
    </div>
    <p class="duplicate">{{ $t('views.my_view.text_with_spaces') }}</p>
    <div class="another-binding">{{ $t('views.my_view.days_remaining_days_left', {daysRemaining:daysRemaining}) }}</div>
    <p class="br">
      {{ $t('views.my_view.text_before_br') }}
      <br/>
      {{ $t('views.my_view.text') }}
    </p>
    <p class="long multiline">
      {{ $t('views.my_view.long_text_lorem_ipsum_is') }}
    </p>
    <section class="long-same-start">
      {{ $t('views.my_view.long_text_lorem_ipsum_is') }}
    </section>
  </div>
</template>
<script>...</script>
```

