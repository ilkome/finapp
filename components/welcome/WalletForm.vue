<script setup lang="ts">
import { allColors } from '~/assets/js/colors'
import { random } from '~/assets/js/emo'
import type { WalletForm } from '~/components/wallets/types'

const emit = defineEmits(['afterSave'])

const { $store, nuxt2Context: { i18n } } = useNuxtApp()

const walletForm = ref<WalletForm>({
  color: random(random(allColors)),
  countTotal: true,
  currency: 'USD',
  isCredit: false,
  name: '',
  order: 1,
})

function updateValue(id, value) {
  walletForm.value[id] = value
}

function afterSave() {
  emit('afterSave')
}

useHead({
  title: () => `${i18n.t('base.add')}:
    ${walletForm.value?.name
      ? walletForm.value?.name
      : i18n.t('categories.form.name.label')}`,
})
</script>

<template lang="pug">
UiPage
  .mb-3.py-5.px-2.font-nunito
    .pb-1.text-xs.font-medium.text-skin-item-base-down
      | {{ $t("wallets.createNewTitle") }}

    .flex.items-center.gap-3
      .text-skin-item-base-up.text-2xl.font-semibold
        | {{ walletForm.name ? walletForm.name : $t("wallets.form.name.label") }}
      .p-1.flex-center.rounded.text-skin-icon-base.text-2xs(:style="{ background: walletForm.color }")
        | {{ walletForm.currency }}

  .pb-12
    WalletsForm(
      :walletForm="walletForm"
      @afterSave="afterSave"
      @updateValue="updateValue"
    )
</template>
