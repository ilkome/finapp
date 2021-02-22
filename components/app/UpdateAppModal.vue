<script>
export default {
  name: 'UpdateAppModal'
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

  Button(
    className="_blue _text-center"
    :title="$t('base.ok')"
    @onClick="$emit('onClose')"
  )
</template>

<style lang="stylus" scoped>
//
</style>
