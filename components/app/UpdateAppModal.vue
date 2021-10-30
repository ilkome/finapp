<script>
import { computed } from '@nuxtjs/composition-api'
import { updateEmo, random } from '~/assets/js/emo'

export default {
  name: 'AppUpdateAppModal',

  setup () {
    const emo = computed(() => random(updateEmo))
    return {
      emo
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(@closed="$emit('onClose')")
  template(#default="{ close }")
    .scrollerBlock
      .wrap
        .emo {{ emo }}
        .header {{ $t('app.update.title') }}
        .text {{ $t('app.update.text') }}

        SharedButton(
          className="_blue2 _text-center _maxWidth"
          :title="$t('base.ok')"
          @onClick="$emit('onClose')"
        )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.wrap
  padding 0 $m7
  text-align center

.header
  padding-bottom $m6
  color var(--c-font-3)
  font-size 22px
  font-weight 700
  fontFamilyNunito()

  /.light-mode &
    color var(--c-font-4)

.text
  padding-bottom $m9

.emo
  padding-top $m8
  padding-bottom $m9
  font-size 86px
</style>
