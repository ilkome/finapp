<script setup lang="ts">
import { getTrnsIds } from '~/components/trns/getTrns'
import { random, successEmo } from '~/assets/js/emo'
import { removeData } from '~/services/firebase/api'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  walletId: WalletId
}>()
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

function onClickDelete() {
  isShowDeleteConfirm.value = true
}

// TODO: translate
async function onDeleteConfirm() {
  // Disable reactive to have data when user have already redirected to wallets page
  const uid = JSON.parse(JSON.stringify($store.state.user.user.uid))
  const trnsIdsS = JSON.parse(JSON.stringify(trnsIds.value))
  const walletIdS = JSON.parse(JSON.stringify(walletId.value))

  router.push('/wallets')

  // Give some time to complete redirect
  setTimeout(async () => {
    await $store.dispatch('trns/deleteTrnsByIds', trnsIdsS)
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
  UiHeaderLink(@click="onClickDelete")
    .mdi.mdi-delete-empty-outline.group-hover_text-white.text-xl

  ModalBottomConfirm(
    :show="isShowDeleteConfirm"
    :description="deleteDescText"
    @onClose="isShowDeleteConfirm = false"
    @onConfirm="onDeleteConfirm"
  )
</template>
