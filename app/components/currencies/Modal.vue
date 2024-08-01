<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

const props = defineProps<{
  activeCode?: CurrencyCode
  isShowAll?: boolean
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
  <BaseBottomSheet2
    isShow
    drugClassesCustom="sm:max-w-md mx-auto bg-foreground-1"
    @closed="emit('onClose')"
  >
    <template #handler="{ close }">
      <BaseBottomSheetHandler />
      <BaseBottomSheetClose @onClick="close" />
    </template>

    <template #default="{ close }">
      <div class="grid gap-4 py-4 px-3">
        <UiTitle3>{{ t('select') }}</UiTitle3>

        <CurrenciesList
          :active="props.activeCode"
          :isShowAll="props.isShowAll"
          @onSelect="(c: CurrencyCode) => onSelect(c, close)"
        />
      </div>
    </template>
  </BaseBottomSheet2>
</template>

<i18n lang="yaml">
  en:
    select: Select currency

  ru:
    select: Выбрать валюту
</i18n>
