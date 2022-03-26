<script setup lang="ts">
import { allColors } from '~/assets/js/colors'
import { random } from '~/assets/js/emo'
import type { WalletForm } from '~/components/wallets/types'

const router = useRouter()

const walletForm = ref<WalletForm>({
  color: random(random(allColors)),
  countTotal: true,
  currency: 'USD',
  isCredit: false,
  name: null,
  order: 1,
})

function updateValue(id, value) {
  walletForm.value[id] = value
}

function afterSave() {
  router.push('/wallets/')
}
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: `${this.$t('base.add')}: ${this.walletForm.name ? this.walletForm.name : this.$t('wallets.form.name.label')}`,
    }
  },
})
</script>

<template lang="pug">
UiPage
  UiHeader
    router-link(v-slot="{ href, navigate }" to="/wallets" custom)
      a.grow.hocus_bg-skin-item-main-hover(:href="href" @click="navigate")
        UiHeaderTitle
          .pb-1.text-xs.font-medium.text-skin-item-base-down
            | {{ $t("wallets.createNewTitle") }}

          .flex.items-center.gap-3
            .text-skin-item-base-up.text-2xl.font-semibold
              | {{ walletForm.name ? walletForm.name : $t("wallets.form.name.label") }}
            .p-1.flex-center.rounded.text-skin-icon-base.text-2xs(:style="{ background: walletForm.color }")
              | {{ walletForm.currency }}

  WalletsForm(
    :walletForm="walletForm"
    @afterSave="afterSave"
    @updateValue="updateValue"
  )
</template>
