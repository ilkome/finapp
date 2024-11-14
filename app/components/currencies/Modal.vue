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
  <Teleport to="body">
    <BaseBottomSheet2
      isShow
      drugClassesCustom="max-w-md bg-foreground-1 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-xl"
      @closed="emit('onClose')"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="grid gap-4 px-3 py-4">
          <UiTitle3>{{ t('select') }}</UiTitle3>

          <CurrenciesList
            :active="props.activeCode"
            :isShowAll="props.isShowAll"
            @onSelect="(c: CurrencyCode) => onSelect(c, close)"
          />
        </div>
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>

<i18n lang="yaml">
  en:
    select: Select currency

  ru:
    select: Выбрать валюту
</i18n>
