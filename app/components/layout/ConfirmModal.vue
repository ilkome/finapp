<script setup lang="ts">
defineProps<{
  description?: string
}>()

const emit = defineEmits<{
  (e: 'closed'): void
  (e: 'onConfirm'): void
}>()

const { t } = useI18n()

const items = computed(() => ({
  no: {
    click: (close: () => void) => {
      close()
    },
    icon: 'mdi:close',
    localeKey: 'base.no',
  },

  yes: {
    click: (close: () => void) => {
      emit('onConfirm')
      close()
    },
    icon: 'mdi:check',
    localeKey: 'base.yes',
  },
}))
</script>

<template>
  <Teleport to="body">
    <BottomSheet
      drugClassesCustom="bottomSheetDrugClassesCustom"
      isShow
      @closed="emit('closed')"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <UiTitleModal>
            {{ t('base.sure') }}
          </UiTitleModal>

          <div class="scrollerBlock bottomSheetContentInside !px-3">
            <div
              v-if="description"
              class="text-alert-1"
            >
              {{ description }}
            </div>

            <div class="flex gap-3 py-4">
              <UiElement
                v-for="(item, slug) in items"
                :key="slug"
                class="grow"
                insideClasses="!min-h-[44px] bg-item-3"
                @click="item.click(close)"
              >
                <template #leftIcon>
                  <Icon
                    :name="item.icon"
                    size="22"
                  />
                </template>

                {{ t(item.localeKey) }}
              </UiElement>
            </div>
          </div>
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
