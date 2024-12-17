<script setup lang="ts">
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { random, successEmo } from '~/assets/js/emo'
import type { WalletId } from '~/components/wallets/types'
import type { TrnId } from '~/components/trns/types'
import UiToastContent from '~/components/ui/ToastContent.vue'

const props = defineProps<{
  walletId: WalletId
}>()

const router = useRouter()
const trnsStore = useTrnsStore()
const walletStore = useWalletsStore()
const { $toast } = useNuxtApp()
const { t } = useI18n()

const trnsIds = computed<TrnId[]>(() => trnsStore.getStoreTrnsIds({
  walletsIds: [props.walletId],
}))

// TODO: translate
const deleteDescText = computed(() => {
  if (trnsIds.value.length > 0)
    return `This action will delete ${trnsIds.value.length} trns in this wallet`
  return undefined
})

const isShowDeleteConfirm = ref(false)
function onClickDelete() {
  isShowDeleteConfirm.value = true
}

async function onDeleteConfirm() {
  const trnsIdsS: TrnId[] = JSON.parse(JSON.stringify(trnsIds.value))
  router.push('/wallets')
  await walletStore.deleteWallet(JSON.parse(JSON.stringify(props.walletId)), trnsIdsS)

  // Give some time to complete redirect
  setTimeout(async () => {
    $toast(UiToastContent, {
      data: {
        description: trnsIdsS?.length > 0
          ? t('wallets.form.delete.okWithTrns', { length: trnsIdsS.length, trns: t('trns.plural', trnsIdsS.length) })
          : t('wallets.form.delete.okWithoutTrns'),
        title: random(successEmo),
      },
      toastId: 'delete-wallet',
      type: 'success',
    })
  }, 300)
}
</script>

<template>
  <div>
    <UiHeaderLink
      icon="mdi:delete-empty-outline"
      @click="onClickDelete"
    >
      {{ t('base.delete') }}
    </UiHeaderLink>

    <LayoutConfirmModal
      v-if="isShowDeleteConfirm"
      :description="deleteDescText"
      @closed="isShowDeleteConfirm = false"
      @onConfirm="onDeleteConfirm"
    />
  </div>
</template>
