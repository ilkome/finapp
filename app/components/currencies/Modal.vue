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
  <Teleport to="body">
    <BottomSheet
      isShow
      drugClassesCustom="bottomSheetDrugClassesCustom"
      @closed="emit('close')"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @click="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <UiTitleModal>{{ t('currencies.select') }}</UiTitleModal>

          <CurrenciesList
            :active="props.activeCode"
            :isShowAllButton="props.isShowAllButton"
            :isHideUnused="props.isHideUnused"
            @select="(c: CurrencyCode) => select(c, close)"
          />
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
