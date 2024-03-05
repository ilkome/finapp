<script setup lang="ts">
const { t } = useI18n()
</script>

<template lang="pug">
div
  .title.pb-4 {{ t('title') }}

  .flex.gap-8.pb-3
    div
      .subTitle.pb-4 {{ t('author') }}
      .name ilkome

    div
      .subTitle.pb-4 {{ t('thanks') }}
      .name TheCarolissy, TihomirovPro
</template>

<style lang="stylus" scoped>
// TODO: use Ui components
.title
  font-h1()
  font-size 18px

.subTitle
  padding-bottom 4px
  color var(--c-font-4)
  font-size 12px

.name
  color var(--c-font-2)
  font-size 14px
  line-height 18px
  font-secondary()
</style>

<i18n lang="yaml">
en:
  title: Creators
  author: Author
  thanks: Thanks for support

ru:
  title: Создатели
  author: Автор
  thanks: Спасибо за поддержку
</i18n>
