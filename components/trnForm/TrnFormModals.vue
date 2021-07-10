<script>
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'TrnFormModals'
})
</script>

<template lang="pug">
.modals
  TrnFormModalCats
  TrnFormModalCatsChild
  TrnFormModalCalendar
  TrnFormModalDescription
  TrnFormModalWallets
  TrnFormModalTransferFrom
  TrnFormModalTransferTo
  TrnFormModalTrn
</template>
