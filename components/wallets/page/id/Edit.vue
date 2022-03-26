<script setup lang="ts">
import { allColors } from '~/assets/js/colors'
import { random } from '~/assets/js/emo'
import type { WalletForm } from '~/components/wallets/types'

const { $store } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const walletId = computed(() => route.params.id)
const wallet = computed(() => $store.state.wallets.items[walletId.value])

const walletForm = ref<WalletForm>({
  color: wallet.value?.color || random(allColors),
  countTotal: wallet.value?.countTotal || true,
  currency: wallet.value?.currency || 'RUB',
  isCredit: wallet.value?.isCredit || false,
  name: wallet.value?.name || null,
  order: wallet.value?.order || 1,
})

function updateValue(id, value) {
  walletForm.value[id] = value
}

function afterSave() {
  router.push(`/wallets/${walletId.value}`)
}
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: `${this.$t('base.edit')}: ${this.walletForm.name ? this.walletForm.name : this.$t('wallets.form.name.label')}`,
    }
  },
})
</script>

<template lang="pug">
UiPage(v-if="wallet")
  UiHeader
    router-link(v-slot="{ href, navigate }" :to="`/wallets/${walletId}`" custom)
      a.grow.hocus_bg-skin-item-main-hover(:href="href" @click="navigate")
        UiHeaderTitle
          .pb-1.text-xs.font-medium.text-skin-item-base-down
            | {{ $t("wallets.editTitle") }}

          .flex.items-center.gap-3
            .text-skin-item-base-up.text-2xl.font-semibold
              | {{ walletForm.name ? walletForm.name : $t("wallets.title") }}
            .p-1.flex-center.rounded.text-skin-icon-base.text-2xs(:style="{ background: walletForm.color }")
              | {{ walletForm.currency }}

    template(#actions)
      WalletsDelete(:walletId="walletId")

  WalletsForm(
    :walletId="walletId"
    :walletForm="walletForm"
    @afterSave="afterSave"
    @updateValue="updateValue"
  )
</template>
