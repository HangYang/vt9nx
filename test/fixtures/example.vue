<template>
  <div>
    <h1 class="translated">{{ $t('base.my_cards') }}</h1>
    <div class="text-with-bindings">for {{amount2}} {{token2}}</div>
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
      <br/>
      text 
      after br
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

<script>
import Vue from 'vue'

export default class Example1 extends Vue {
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/scss/variables';
.page-title {
  font-size: 34px;
  color: #00e365 !important;
  font-family: soleil, sans-serif;
  margin-bottom: 25px;
}
</style>