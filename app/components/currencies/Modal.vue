<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

const props = defineProps<{
  activeCode?: CurrencyCode
  isHideUnused?: boolean
  isShowAllButton?: boolean
}>()

const emit = defineEmits<{
  onClose: []
  onSelect: [code: CurrencyCode]
}>()

const { t } = useI18n()

function onSelect(code: CurrencyCode, close: () => void) {
  emit('onSelect', code)
  close()
}
</script>

<template>
  <Teleport to="body">
    <BottomSheet
      isShow
      drugClassesCustom="bottomSheetDrugClassesCustom"
      @closed="emit('onClose')"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <UiTitleModal>{{ t('currencies.select') }}</UiTitleModal>

          <CurrenciesList
            :active="props.activeCode"
            :isShowAllButton="props.isShowAllButton"
            :isHideUnused="props.isHideUnused"
            @onSelect="(c: CurrencyCode) => onSelect(c, close)"
          />
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
