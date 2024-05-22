<script setup lang="ts">
import { getTrnsIds } from '~/components/trns/getTrns'
import { random, successEmo } from '~/assets/js/emo'
import { removeData } from '~/services/firebase/api'
import type { WalletId } from '~/components/wallets/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUser'

const props = defineProps<{
  walletId: WalletId
}>()
const { walletId } = toRefs(props)

const { $notify } = useNuxtApp()
const router = useRouter()
const userStore = useUserStore()
const trnsStore = useTrnsStore()

const trnsItems = computed(() => trnsStore.items)
const trnsIds = computed(() =>
  getTrnsIds({
    trnsItems: trnsItems.value,
    walletsIds: [walletId.value],
  }))

const isShowDeleteConfirm = ref(false)

// TODO: translate
const deleteDescText = computed(() => {
  if (trnsIds.value.length > 0)
    return `This action will delete ${trnsIds.value.length} trns in this wallet`
  return undefined
})

function onClickDelete() {
  isShowDeleteConfirm.value = true
}

// TODO: translate
async function onDeleteConfirm() {
  // Disable reactive to have data when user have already redirected to wallets page
  const uid = JSON.parse(JSON.stringify(userStore.uid))
  const trnsIdsS = JSON.parse(JSON.stringify(trnsIds.value))
  const walletIdS = JSON.parse(JSON.stringify(walletId.value))

  router.push('/wallets')

  // Give some time to complete redirect
  setTimeout(async () => {
    await trnsStore.deleteTrnsByIds(trnsIdsS)
    removeData(`users/${uid}/accounts/${walletIdS}`)
      .then(() => {
        $notify({
          text: trnsIdsS?.length > 0 ? `Success delete wallet with ${trnsIdsS.length} transactions!` : 'Success delete wallet!',
          title: random(successEmo),
          type: 'success',
        })
      })
  }, 100)
}
</script>

<template lang="html">
  <div>
    <UiHeaderLink @click="onClickDelete">
      <i class="mdi mdi-delete-empty-outline group-hover:text-white text-xl" />
    </UiHeaderLink>

    <LayoutConfirmModal
      :show="isShowDeleteConfirm"
      :description="deleteDescText"
      @closed="isShowDeleteConfirm = false"
      @onConfirm="onDeleteConfirm"
    />
  </div>
</template>
