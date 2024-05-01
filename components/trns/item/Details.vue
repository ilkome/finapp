<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~~/components/wallets/types'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(
  defineProps<{
    category: object
    isActive?: boolean
    showCategory?: boolean
    trn: TrnItem
    trnId: TrnId
    ui?: string
    wallet: WalletItem
  }>(),
  {
    ui: 'history',
  },
)

const emit = defineEmits<{
  (e: 'onClickEdit', trnId: TrnId): void
}>()

const { trnFormEdit } = useTrnForm()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()

const classes = computed(() => ({
  _active: props.isActive,
  _detailed: props.ui === 'detailed',
  _history:
    props.ui === 'history' || (props.ui === 'stat' && props.showCategory),
  _stat: props.ui === 'stat',
}))

const formattedDate = computed(() => {
  const date = formatDate(props.trn.date, 'full')
  return `${date.weekday}, ${date.day} ${date.month} ${date.year}`
})

function handleClick() {
  if (!useTrnsStore.isShownModal) {
    trnsStore.showTrnModal()
    trnsStore.setTrnModalId(props.trnId)
  }
}

function setTrnEdit() {
  const trnId = props.trnId
  trnFormEdit(trnId)
  emit('onClickEdit', trnId)
}
</script>

<template>
  <div
    v-if="(category && wallet) || trn.type === 2"
    class="trnItem px-3 py-3"
    :class="{
      ...classes,
      '':
        trn.type === 2 && trn.incomeAmount && trn.expenseAmount,
    }"
    @click="handleClick"
  >
    <!-- Transfer -->
    <template v-if="trn.type === 2 && trn.incomeAmount && trn.expenseAmount">
      <div class="trnItem__categoryIcon">
        <Icon :background="category.color" :icon="category.icon" big round />
      </div>
      <div class="trnItem__categoryName">
        {{ $t("trnForm.transferTitle") }}
      </div>
      <div class="trnItem__date">
        {{ formattedDate }}
      </div>

      <div class="flex items-center gap-5">
        <!-- Expense -->
        <div>
          <div class="pb-2">
            <WalletsItem
              :wallet="walletsStore.sortedItems[trn.expenseWalletId]"
              :walletId="trn.expenseWalletId"
            />
          </div>
          <div class="text-2xl text-item-base">
            <Amount
              :amount="trn.expenseAmount"
              :currencyCode="walletsStore.items[trn.expenseWalletId].currency"
              :type="0"
              align="center"
              colorize="expense"
            />
          </div>
        </div>

        <!-- Separator -->
        <div class="mdi mdi-chevron-right text-2xl" />

        <!-- Income -->
        <div>
          <div class="pb-2">
            <WalletsItem
              :wallet="walletsItemsSorted[trn.incomeWalletId]"
              :walletId="trn.incomeWalletId"
            />
          </div>
          <div class="text-2xl text-item-base">
            <Amount
              :amount="trn.incomeAmount"
              :currencyCode="walletsStore.items[trn.incomeWalletId].currency"
              :type="1"
              align="center"
              colorize="income"
            />
          </div>
        </div>
      </div>
      <div
        v-if="trn.desc || trn.description"
        class="trn__desc whitespace-pre font-roboto !text-xs leading-none"
      >
        {{ trn.desc || trn.description }}
      </div>
    </template>

    <!-- Transaction -->
    <template v-else>
      <div class="trnItem__categoryIcon">
        <Icon :background="category.color" :icon="category.icon" big round />
      </div>
      <div class="trnItem__categoryName">
        {{ category.name }}
      </div>
      <div class="trnItem__wallet">
        <div class="walletIcon">
          <Icon :abbr="wallet.name" :background="wallet.color" small />
        </div>
        <div class="walletName">
          {{ wallet.name }}
        </div>
      </div>
      <div class="trnItem__date">
        {{ formattedDate }}
      </div>
      <div class="trnItem__amount text-4xl" @click.stop="setTrnEdit">
        <Amount
          :amount="trn.amount"
          :currencyCode="wallet.currency"
          :colorize="trn.type === 0 ? 'expense' : 'income'"
          :type="trn.type"
          align="center"
        />
      </div>
      <div v-if="trn.description" class="trnItem__desc">
        {{ trn.description }}
      </div>
    </template>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.trnItem
  position relative
  color var(--c-font-4)
  display flex
  flex-flow column
  align-items center
  justify-content center
  margin-bottom -10px
  text-align center

  &__amount
    align-self center
    padding-top 6px

  &__categoryIcon
    margin-top -38px
    padding-bottom 12px

  &__categoryName
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    padding-bottom 10px
    color var(--c-font-2)
    font-size 22px
    font-secondary()

  &__date
    padding-bottom 20px
    font-size 14px

  &__desc
    color var(--c-font-2)
    font-size 14px
    padding-top 16px

  &__wallet
    display flex
    align-items center
    padding-bottom 10px

    .walletIcon
      margin-right 8px

    .walletName
      font-size 14px
      white-space nowrap

    .walletName
      font-size 16px
</style>
