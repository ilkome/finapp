<script>
import { ref } from '@nuxtjs/composition-api'

export default {
  name: 'HeyPage',

  setup () {
    const isShowActive = ref(false)
    const isShowLazy = ref(false)

    return {
      isShowActive,
      isShowLazy
    }
  }
}
</script>

<template lang="pug">
.p
  div
    h1 hello
    div(@click="isShowActive = !isShowActive") isShowActiveLazy {{ isShowActive }}
    div(@click="isShowLazy = !isShowLazy") isShowLazy {{ isShowLazy }}

  //- Modal(
  //-   :isShow="isShowActive"
  //-   @afterClose="isShowActive = false"
  //- )

  LazyModal(
    v-if="isShowLazy"
    isShow
    @afterClose="isShowLazy = false"
  )
</template>

<style lang="stylus" scoped>
.p
  position relative
  display grid
  height 100vh
  padding 16px
</style>
