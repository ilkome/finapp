<script>
export default {
  name: 'AppUpdateAppModal'
}
</script>

<template lang="pug">
ModalBottom(
  @onClose="$emit('onClose')"
  @afterClose="$emit('afterClose')"
)
  .ta_center
    //- template(slot="header")
    h3 {{ $t('app.update.title') }}
    p {{ $t('app.update.text') }}

    SharedButton(
      className="_blue2 _text-center"
      :title="$t('base.ok')"
      @onClick="$emit('onClose')"
    )
</template>

<style lang="stylus" scoped>
.ta_center
  text-align center
</style>
