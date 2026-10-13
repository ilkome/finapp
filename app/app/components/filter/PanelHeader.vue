<script setup lang="ts">
const props = defineProps<{
  isShowClose?: boolean
  // 'select': the transaction form's single-pick sheet. Its per-slide actions live in a toolbar
  // under the tabs (as in the stat filter), so the header keeps only the title, reset, search and close.
  mode?: 'filter' | 'select'
  showReset: boolean
  // Overrides the "Фильтры" title - the single-pick sheet shows the active slide's name instead.
  title?: string
}>()

const emit = defineEmits<{
  close: []
  reset: []
}>()

const isSelectMode = computed(() => props.mode === 'select')
const showClose = computed(() => props.isShowClose || isSelectMode.value)

const search = defineModel<string>('search', { default: '' })

const { t } = useI18n()
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const isSearchOpen = ref(false)

async function openSearch() {
  isSearchOpen.value = true
  await nextTick()
  const focus = () => searchInput.value?.focus()
  requestAnimationFrame(focus)
  setTimeout(focus, 250)
}

function closeSearch() {
  search.value = ''
  isSearchOpen.value = false
}
</script>

<template>
  <div class="relative">
    <UiTitleModal :hasClose="showClose">
      {{ props.title ?? t('base.filters') }}

      <template #actions>
        <UiTriggerButton
          v-if="!isSelectMode && props.showReset"
          icon="lucide:filter-x"
          :title="t('base.reset')"
          @click="emit('reset')"
        />

        <UiTriggerButton icon="lucide:search" :title="t('base.search')" @click="openSearch" />
      </template>
    </UiTitleModal>

    <UiButtonClose v-if="showClose && !isSearchOpen" @click="emit('close')" />

    <!-- Expanded search covers the title and the toolbar. -->
    <div
      v-if="isSearchOpen"
      class="absolute inset-x-3 inset-y-1 z-10 rounded-md bg-default"
    >
      <input
        ref="searchInput"
        v-model="search"
        type="text"
        :aria-label="t('base.search')"
        class="m-0 size-full rounded-md border border-transparent bg-elevated/30 py-2 pr-11 pl-4 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50"
        :placeholder="t('base.search')"
        @keydown.escape.stop="closeSearch"
      >
      <div class="absolute inset-y-1 right-1 aspect-square">
        <UTooltip :text="t('base.close')">
          <button
            type="button"
            :aria-label="t('base.close')"
            class="flex size-full items-center justify-center rounded-full interactive bg-elevated text-muted"
            @click="closeSearch"
          >
            <Icon name="lucide:x" size="18" />
          </button>
        </UTooltip>
      </div>
    </div>
  </div>
</template>
