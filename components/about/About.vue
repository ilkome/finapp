<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div>
    <div class="title pb-4">
      {{ t("title") }}
    </div>

    <div class="flex gap-8 pb-3">
      <div>
        <div class="subTitle pb-4">
          {{ t("author") }}
        </div>
        <div class="name">
          ilkome
        </div>
      </div>

      <div>
        <div class="subTitle pb-4">
          {{ t("thanks") }}
        </div>
        <div class="name">
          TheCarolissy, TihomirovPro
        </div>
      </div>
    </div>
  </div>
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
