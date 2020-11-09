<script>
export default {
  name: 'About'
}
</script>

<template lang="pug">
.about
  .about__title {{ $t('about.creators.title') }}

  .aboutPerson
    .aboutPerson__title {{ $t('about.creators.author') }}
    .aboutPerson__name @ilkome

  .aboutPerson
    .aboutPerson__title {{ $t('about.creators.ideas') }}
    .aboutPerson__name @TheCarolissy <br/>@TihomirovPro
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.about
  &__title
    padding-bottom $m9
    font-h1()

    +media-laptop()
      font-size 28px

.aboutPerson
  padding-bottom $m10

  &__title
    padding-bottom $m5
    color var(--c-font-3)
    font-size 16px

  &__name
    font-size 20px
    line-height 32px
    fontFamilyNunito()
</style>
