<script setup lang="ts">
import { random, updateEmo } from '~/assets/js/emo'
const emo = computed(() => random(updateEmo))
</script>

<template lang="pug">
TrnFormModal(@closed="$emit('onClose')")
  .py-5.lg_py-8.text-center
    .emo {{ emo }}
    .header {{ $t('title') }}
    .pb-10 {{ $t('text') }}

    SharedButton(
      className="_blue2 _text-center _maxWidth"
      :title="$t('button')"
      @onClick="$emit('onClose')"
    )
</template>

<style lang="stylus" scoped>
.header
  padding-bottom $m6
  color var(--c-font-3)
  font-size 22px
  font-weight 700
  fontFamilyNunito()

  /.light &
    color var(--c-font-4)

.emo
  padding-top $m8
  padding-bottom $m9
  font-size 86px
</style>

<i18n lang="json5">
{
  "en": {
    "title": "New version available",
    "text": "Reload the app to use new futures.",
    "button": "Wow, great!"
  },

  "ru": {
    "title": "Доступа новая версия",
    "text": "Перезагрузите приложение, чтобы использовать все новые фишки.",
    "button": "Оки, Ура!"
  }
}
</i18n>
