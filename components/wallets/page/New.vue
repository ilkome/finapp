<script setup lang="ts">
import { getPreparedFormData } from '~/components/wallets/getForm'

const router = useRouter()
const walletForm = ref(getPreparedFormData())

const updateValue = (id, value) => walletForm.value[id] = value
const afterSave = () => router.replace('/wallets')
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
      a.grow.hocus_bg-item-main-hover(:href="href" @click="navigate")
        UiHeaderTitle
          .pb-1.text-xs.font-medium.text-item-base-down
            | {{ $t("wallets.createNewTitle") }}

          .flex.items-center.gap-3
            .text-item-base-up.text-2xl.font-semibold
              | {{ walletForm.name ? walletForm.name : $t("wallets.form.name.label") }}
            .p-1.flex-center.rounded.text-icon-base.text-2xs(:style="{ background: walletForm.color }")
              | {{ walletForm.currency }}

  WalletsForm(
    :walletForm="walletForm"
    @afterSave="afterSave"
    @updateValue="updateValue"
  )
</template>
