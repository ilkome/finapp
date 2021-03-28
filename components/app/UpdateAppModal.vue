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
  //- template(slot="header")
  h3 {{ $t('app.update.title') }}
  p {{ $t('app.update.text') }}

  SharedButton(
    className="_blue _text-center"
    :title="$t('base.ok')"
    @onClick="$emit('onClose')"
  )
</template>

<style lang="stylus" scoped>
//
</style>
