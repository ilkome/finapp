<script setup lang="ts">
import { removeData } from '~/services/firebase/api'
import useFilter from '~/modules/filter/useFilter'
import { getTrnsIds } from '~/components/trns/functions/getTrns'

const { $store } = useNuxtApp()
const { setFilterWalletsId } = useFilter()

const route = useRoute()
const router = useRouter()

const walletId = computed(() => route.params.id)
const wallet = computed(() => $store.state.wallets.items[walletId.value])
if (!wallet.value)
  router.replace('/wallets')

const trnsItems = computed(() => $store.state.trns.items)
const total = computed(() => $store.getters['wallets/walletsTotal'][walletId.value].base)

const filter = reactive({ trnType: null })
const trnsIds = computed(() =>
  getTrnsIds({
    walletsIds: [walletId.value],
    trnType: filter.trnType,
    trnsItems: trnsItems.value,
  }))

const filteredTrnsIds = computed(() => $store.getters['trns/selectedTrnsIdsWithDate'].filter(trnId => $store.state.trns.items[trnId].walletId === walletId.value))

const showModalConfirm = ref(false)
const deleteInfo = computed(() => {
  if (trnsIds.value.length > 0)
    return `It's also will delete ${trnsIds.value.length} trns in this wallet`
  return false
})

function handleSetFilterWallet() {
  setFilterWalletsId(walletId.value)
  $store.commit('filter/setFilterDateNow')
  $store.dispatch('ui/setActiveTabStat', 'details')
}

function handleEditClick() {
  router.push(`/wallets/${walletId.value}/edit`)
}

function handleDeleteClick() {
  showModalConfirm.value = true
}

function handleDeleteConfirm() {
  const uid = $store.state.user.user.uid
  const id = JSON.parse(JSON.stringify(walletId.value))
  const trnsIdsForDelete = JSON.parse(JSON.stringify(trnsIds.value))

  showModalConfirm.value = false
  router.replace('/wallets')

  setTimeout(async() => {
    await $store.dispatch('trns/deleteTrnsByIds', trnsIdsForDelete)
    removeData(`users/${uid}/accounts/${id}`)
      .then(() => console.log('wallet deleted'))
  }, 200)
}
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: `${this.$t('wallets.title')}: ${this.wallet.name}`,
    }
  },
})
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto.max-w-3xl.h-full(
  class="pb-[44px] md_pb-[52px] lg_pb-0"
)
  template(v-if="wallet")
    router-link(
      v-slot='{ href, navigate }'
      to='/wallets'
      custom
    )
      .flex.items-start
        a.grow.cursor-pointer.block.py-5.mb-3.px-3.font-nunito.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
          :href='href'
          @click='navigate'
        )
          .pb-2.text-xs.font-medium(class="text-white/50") {{ $t('wallets.title') }}

          .flex.items-center.gap-3.pb-3
            .text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold {{ wallet.name }}
            .p-1.px-1.rounded.flex-center.text-2xs.text-neutral-50(
              :style="{ background: wallet.color }"
            ) {{ wallet.currency }}

          .flex
            Amount(
              :currency="wallet.currency"
              :value="total"
              showBase
              size="lg"
              vertical="right"
            )

        .mdi.mdi-pencil-outline.cursor-pointer.rounded-full.mt-3.mr-2.w-16.h-16.flex-center.text-2xl.p-4.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
          @click="handleEditClick"
        )

    .pb-6
      .px-3.flex
        .cursor-pointer.p-1.px-3.flex.items-center.gap-3.bg-gray-50.dark_bg-dark4.rounded-md.hocus_bg-gray-100.dark_hocus_bg-neutral-800.shadow.hocus_shadow-lg(
          class="dark_text-white/60"
          @click="handleSetFilterWallet"
        )
          .mdi.mdi-poll.text-xl
          .text-xs.leading-none {{ $t('statBy') }}: {{ wallet.name }}
          .mdi.mdi-chevron-right.opacity-70.text-lg.leading-none

    //- Stat
    .overflow-hidden.relative.bg-white.dark_bg-custom4.mx-3.mb-12.p-3.rounded-md
      SharedDate.text-xs.font-medium(class="-mb-1 text-white/50")
      div(class="-mb-3")
        StatGroupSum2(
          :trnsIds="filteredTrnsIds"
        )

    //- History
    .px-3
      TrnsHistory(
        :trnsIds="trnsIds"
        :trnType="filter.trnType"
        @setFilterTrnType="value => filter.trnType = value"
      )

  //- Delete?
  ModalBottomConfirm(
    :show="showModalConfirm"
    :description="deleteInfo"
    @onClose="showModalConfirm = false"
    @onConfirm="handleDeleteConfirm"
  )
</template>

<i18n lang="json5">
{
  "en": {
    "statBy": "Statistics",
  },
  "ru": {
    "statBy": "Статистика",
  },
}
</i18n>
