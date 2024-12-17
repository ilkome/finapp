<script setup lang="ts">
defineProps<{
  description?: string
}>()

const emit = defineEmits<{
  (e: 'closed'): void
  (e: 'onConfirm'): void
}>()

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
      isShow
      :isScrollerBlock="false"
      drugClassesCustom="max-w-sm bg-foreground-1 md:bottom-1/2 md:-translate-x-1/2 md:translate-y-1/2 rounded-xl"
      @closed="emit('closed')"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="grid gap-3 p-1 pt-6">
          <div class="pl-2">
            {{ $t('base.sure') }}
          </div>

          <div
            v-if="description"
            class="text-alert-primary px-2"
          >
            {{ description }}
          </div>

          <div class="flex gap-4 p-4">
            <UiElement
              v-for="(item, slug) in items"
              :key="slug"
              class="grow"
              insideClasses="!min-h-[44px] bg-item-4"
              @click="item.click(close)"
            >
              <template #leftIcon>
                <Icon
                  :name="item.icon"
                  size="22"
                />
              </template>

              <div class="text-secondary leading-none">
                {{ $t(item.localeKey) }}
              </div>
            </UiElement>
          </div>
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
