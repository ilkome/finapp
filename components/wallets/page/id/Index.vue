<script setup lang="ts">
import useFilter from '~/components/filter/useFilter'
import { getTrnsIds } from '~/components/trns/getTrns'

const { $store } = useNuxtApp()
const { setFilterWalletsId } = useFilter()

const route = useRoute()
const router = useRouter()

const walletId = computed(() => route.params.id)
const wallet = computed(() => $store.state.wallets.items[walletId.value])

if (!wallet.value)
  router.replace('/wallets')

const total = computed(() => $store.getters['wallets/walletsTotal'][walletId.value])

const trnsItems = computed(() => $store.state.trns.items)
const trnsIds = computed(() =>
  getTrnsIds({
    walletsIds: [walletId.value],
    trnsItems: trnsItems.value,
  }),
)

const periodTrnsIds = computed(() => $store.getters['trns/selectedTrnsIdsWithDate']
  .filter(trnId => $store.state.trns.items[trnId].walletId === walletId.value))

// TODO: useFilter
function onClickFilterWallet() {
  setFilterWalletsId(walletId.value)
  $store.commit('filter/setFilterDateNow')
  $store.dispatch('ui/setActiveTabStat', 'details')
}

function onEditClick() {
  router.push(`/wallets/${walletId.value}/edit`)
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
UiPage(v-if="wallet")
  UiHeader
    router-link(v-slot="{ href, navigate }" to="/wallets" custom)
      a.grow.hocus_bg-skin-item-main-hover(:href="href" @click="navigate")
        UiHeaderTitle
          .pt-1.text-xs.font-medium.text-skin-item-base-down
            | {{ $t("wallets.title") }}

          .pb-1.flex.items-center.gap-3
            .text-skin-item-base-up.text-2xl.font-semibold
              | {{ wallet.name }}
            .p-1.flex-center.rounded.text-skin-icon-base.text-2xs(:style="{ background: wallet.color }")
              | {{ wallet.currency }}

    template(#actions)
      UiHeaderLink(@click="onEditClick")
        .mdi.mdi-pencil-outline.group-hover_text-white.text-xl

  .mb-6.pt-3.px-2.flex.text-3xl.font-normal
    Amount(
      :amount="total"
      :currencyCode="wallet.currency"
    )

  .mb-6.px-2.text-sm.text-skin-item-base-down(v-if="wallet.description") {{ wallet.description }}

  .mb-6
    .px-2.flex
      .cursor-pointer.p-1.px-3.flex.items-center.gap-3.bg-gray-50.dark_bg-dark4.rounded-md.hocus_bg-gray-100.dark_hocus_bg-neutral-800.shadow.hocus_shadow-lg(
        class="dark_text-white/60"
        @click="onClickFilterWallet"
      )
        .mdi.mdi-poll.text-xl
        .text-xs.leading-none {{ $t("statBy") }}: {{ wallet.name }}
        .mdi.mdi-chevron-right.opacity-70.text-lg.leading-none

  //- Stat
  .overflow-hidden.relative.bg-gray-50.dark_bg-custom4.mx-3.mb-12.p-3.rounded-md
    SharedDate.text-xs.font-medium(
      class="-mb-1 dark_text-white/50"
      :date="$day().valueOf()"
      :period="$store.state.filter.period"
    )
    div(class="-mb-3")
      WalletsItemTotalSum(
        :trnsIds="periodTrnsIds"
        :walletId="walletId"
      )

  //- History
  .px-2
    TrnsListWithControl(:trnsIds="trnsIds")
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
