<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'
import UiToastContent from '~/components/ui/ToastContent.vue'
import type { WalletId } from '~/components/wallets/types'
import { random, successEmo } from '~/assets/js/emo'
import { removeData } from '~~/services/firebase/api'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'

const props = defineProps<{
  walletId: WalletId
}>()

const { walletId } = toRefs(props)
const { $toast } = useNuxtApp()
const router = useRouter()
const userStore = useUserStore()
const trnsStore = useTrnsStore()

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
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
        $toast(UiToastContent, {
          data: {
            description: trnsIdsS?.length > 0 ? `Success delete wallet with ${trnsIdsS.length} transactions!` : 'Success delete wallet!',
            title: random(successEmo),
          },
          toastId: 'validate',
          type: 'success',
        } as ToastOptions)
      })
  }, 100)
}
</script>

<template>
  <div>
    <UiHeaderLink @click="onClickDelete">
      <i class="mdi mdi-delete-empty-outline group-hover:text-white text-xl" />
    </UiHeaderLink>

    <LayoutConfirmModal
      v-if="isShowDeleteConfirm"
      :show="isShowDeleteConfirm"
      :description="deleteDescText"
      @closed="isShowDeleteConfirm = false"
      @onConfirm="onDeleteConfirm"
    />
  </div>
</template>
