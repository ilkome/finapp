<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

const props = defineProps<{
  activeCode?: CurrencyCode
  isHideUnused?: boolean
  isShowAllButton?: boolean
}>()

const emit = defineEmits<{
  close: []
  select: [code: CurrencyCode]
}>()

const { t } = useI18n()

function select(code: CurrencyCode, close: () => void) {
  emit('select', code)
  close()
}
</script>

<template>
  <BottomSheetModal @closed="emit('close')">
    <template #default="{ close }">
      <UiTitleModal>{{ t('currencies.select') }}</UiTitleModal>

      <CurrenciesList
        :active="props.activeCode"
        :isShowAllButton="props.isShowAllButton"
        :isHideUnused="props.isHideUnused"
        @select="(c: CurrencyCode) => select(c, close)"
      />
    </template>
  </BottomSheetModal>
</template>
