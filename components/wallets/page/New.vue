<script setup lang="ts">
import { popularColors } from '~/assets/js/colorsPopular'
import { random } from '~/assets/js/emo'
import generateId from '~/utils/id'

const { $store, $notify, nuxt2Context: { i18n } } = useNuxtApp()
const router = useRouter()

const walletId = computed(() => generateId())

const walletForm = ref({
  color: random(popularColors),
  countTotal: true,
  currency: 'USD',
  isCredit: false,
  name: null,
  order: 1,
})

function updateValue(id, value) {
  walletForm.value[id] = value
}

function onSave() {
  const wallets = $store.state.wallets.items

  // name
  if (!walletForm.value.name) {
    $notify({
      title: '😮',
      text: i18n.t('wallets.form.name.error'),
    })
    return false
  }

  // currency
  if (!walletForm.value.currency) {
    $notify({
      title: '😮',
      text: i18n.t('wallets.form.currency.error'),
    })
    return false
  }

  for (const id in wallets) {
    if (wallets[id].name === walletForm.value.name) {
      if (walletId.value) {
        if (walletId.value !== id) {
          $notify({
            title: '😮',
            text: i18n.t('wallets.form.name.exist'),
          })
          return false
        }
      }
      else {
        $notify({
          title: '😮',
          text: i18n.t('wallets.form.name.exist'),
        })
        return false
      }
    }
  }

  const id = walletId.value

  const walletsValues = {
    color: walletForm.value.color,
    countTotal: walletForm.value.countTotal,
    currency: walletForm.value.currency,
    isCredit: walletForm.value.isCredit,
    name: walletForm.value.name,
    order: walletForm.value.order,
  }

  $store.dispatch('wallets/addWallet', { id, values: walletsValues })
  router.push('/wallets/')
}
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: `${this.$t('base.edit')}: ${this.wallet?.name}`,
    }
  },
})
</script>

<template lang="pug">
.overflow.overflow-x-auto.h-full.max-w-3xl(
  class="pb-[44px] md_pb-[52px] lg_pb-0"
)
  .mb-3.py-5.px-3.font-nunito
    .pb-1.text-xs.font-medium.text-skin-item-base-down
      | {{ $t("wallets.createNewTitle") }}

    .flex.items-center.gap-3
      .text-skin-item-base-up.text-2xl.font-semibold
        | {{ walletForm.name ? walletForm.name : $t("wallets.form.name.label") }}
      .p-1.flex-center.rounded.text-skin-icon-base.text-2xs(:style="{ background: walletForm.color }")
        | {{ walletForm.currency }}

  WalletsForm(
    :walletForm="walletForm"
    @onSave="onSave"
    @updateValue="updateValue"
  )
</template>
