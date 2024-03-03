<script setup lang="ts">
import { getPreparedFormData } from '~/components/wallets/getForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const walletsStore = useWalletsStore()

const walletId = computed(() => route.params.id)
const wallet = computed(() => walletsStore.items[walletId.value])
const walletForm = ref(getPreparedFormData(wallet.value))

const updateValue = (id, value) => walletForm.value[id] = value
const afterSave = () => router.push(`/wallets/${walletId.value}`)

useHead({
  title: `${t('base.edit')}: ${walletForm.value?.name
    ? walletForm.value?.name
    : t('wallets.form.name.label')}`,
})
</script>

<template lang="pug">
UiPage(v-if="wallet")
  UiHeader
    router-link(v-slot="{ href, navigate }" :to="`/wallets/${walletId}`" custom)
      a.grow.hocus_bg-item-main-hover(:href="href" @click="navigate")
        UiHeaderTitle
          .pb-1.text-xs.font-medium.text-item-base-down
            | {{ $t("wallets.editTitle") }}

          .flex.items-center.gap-3
            .text-item-base-up.text-2xl.font-semibold
              | {{ walletForm.name ? walletForm.name : $t("wallets.title") }}
            .p-1.flex-center.rounded.text-icon-base.text-2xs(:style="{ background: walletForm.color }")
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
