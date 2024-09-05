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
  // eslint-disable-next-line perfectionist/sort-objects
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
    <BaseBottomSheet2
      isShow
      :isScrollerBlock="false"
      drugClassesCustom="max-w-sm bg-foreground-1 md:bottom-1/2 md:-translate-x-1/2 md:translate-y-1/2 rounded-xl"
      @closed="emit('closed')"
    >
      <template #handler="{ close }">
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="grid gap-3 pt-6 px-1 py-1">
          <div class="pl-2">
            {{ $t('base.sure') }}
          </div>

          <div
            v-if="description"
            class="text-alert-primary px-2"
          >
            {{ description }}
          </div>

          <div class="flex p-4 gap-4">
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
    </BaseBottomSheet2>
  </Teleport>
</template>
