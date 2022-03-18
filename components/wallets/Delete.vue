<script setup lang="ts">
import { getTrnsIds } from '~/components/trns/functions/getTrns'
import { random, successEmo } from '~/assets/js/emo'
import { removeData } from '~/services/firebase/api'
import type { WalletID } from '~/components/wallets/types'

interface Props {
  walletId: WalletID
}
const props = defineProps<Props>()
const { walletId } = toRefs(props)

const { $store, $notify } = useNuxtApp()
const router = useRouter()

const trnsItems = computed(() => $store.state.trns.items)
const trnsIds = computed(() =>
  getTrnsIds({
    walletsIds: [walletId.value],
    trnsItems: trnsItems.value,
  }))

const isShowDeleteConfirm = ref(false)

// TODO: translate
const deleteDescText = computed(() => {
  if (trnsIds.value.length > 0)
    return `It's also will delete ${trnsIds.value.length} trns in this wallet`
  return null
})

// TODO: translate
async function onDeleteConfirm() {
  // Disable reactive to have data when user have already redirected to wallets page
  const uid = JSON.parse(JSON.stringify($store.state.user.user.uid))
  const trnsIdsS = JSON.parse(JSON.stringify(trnsIds.value))
  const walletIdS = JSON.parse(JSON.stringify(walletId.value))

  router.push('/wallets')

  // Give some time to complete redirect
  setTimeout(async() => {
    await this.$store.dispatch('trns/deleteTrnsByIds', trnsIdsS)
    removeData(`users/${uid}/accounts/${walletIdS}`)
      .then(() => {
        $notify({
          type: 'success',
          text: trnsIdsS?.length > 0 ? `Success delete wallet with ${trnsIdsS.length} transactions!` : 'Success delete wallet!',
          title: random(successEmo),
        })
      })
  }, 100)
}
</script>

<template lang="pug">
div
  .mdi.mdi-delete-empty-outline.cursor-pointer.rounded-full.mt-3.mr-2.w-16.h-16.flex-center.text-2xl.p-4.hocus_text-red-500.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
    @click="isShowDeleteConfirm = true"
  )

  ModalBottomConfirm(
    :show="isShowDeleteConfirm"
    :description="deleteDescText"
    @onClose="isShowDeleteConfirm = false"
    @onConfirm="onDeleteConfirm"
  )
</template>
