<script>
export default {
  name: 'About'
}
</script>

<template lang="pug">
.about
  .about__title {{ $t('about.creators.title') }}

  .about__wrap
    .aboutPerson
      .aboutPerson__title {{ $t('about.creators.author') }}
      .aboutPerson__name ilkome

    .aboutPerson
      .aboutPerson__title {{ $t('about.creators.thanks') }}
      .aboutPerson__name TheCarolissy, TihomirovPro
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.about
  &__title
    padding-bottom $m7
    font-h1()
    font-size 18px

  &__wrap
    display flex
    gap $mb2
    padding-bottom $m7

.aboutPerson
  &__title
    padding-bottom $m4
    color var(--c-font-4)
    font-size 12px

  &__name
    color var(--c-font-2)
    font-size 14px
    line-height 18px
    fontFamilyNunito()
</style>
