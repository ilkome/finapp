<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const $trnForm = useTrnFormStore()
const walletsStore = useWalletsStore()

const walletId = computed(() => {
  const walletsIds = Object.keys(walletsStore.items ?? {})
  const walletId = walletsIds[0]
  return $trnForm.values.walletId ?? walletId
})
</script>

<template lang="pug">
.py-4
  UiTitle.pb-2.px-3(@click="$trnForm.values.trnId = null")
    template(v-if="$trnForm.values.trnId") {{ $t('trnForm.titleEditTrn') }}
    template(v-if="!$trnForm.values.trnId") {{ $t('trnForm.createTrn') }}

  TrnFormDate
  TrnFormMainAmountTrn(v-if="$trnForm.values.trnType !== 2")
  TrnFormMainAmountTransfer(v-if="$trnForm.values.trnType === 2")

  TrnFormMainCalculator.pb-2(
    :amountRaw="$trnForm.values.amountRaw[$trnForm.activeAmountIdx]"
    @onChange="$trnForm.onChangeAmount"
  )

  //- Selected
  .px-2.pb-2.grid.grid-cols-2.gap-3(
    v-if="$trnForm.values.trnType !== 2"
  )
    VDropdown(v-if="walletId")
      TrnFormMainSelectedWallet(:id="walletId")
      template(#popper="{ hide }")
        WalletsSelector2(
          :hide="hide"
          @onSelected="id => $trnForm.values.walletId = id"
        )

    TrnFormMainSelectedCategory

  TrnFormMainTypes
</template>
