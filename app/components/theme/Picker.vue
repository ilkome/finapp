<script setup lang="ts">
import { omit } from '#ui/utils'
import colors from 'tailwindcss/colors'

const props = defineProps<{
  inline?: boolean
}>()

const appConfig = useAppConfig()
const colorMode = useColorMode()
const { t } = useI18n()
const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone']
const neutral = computed({
  get() {
    return appConfig.ui.colors.neutral
  },
  set(option) {
    appConfig.ui.colors.neutral = option
    window.localStorage.setItem('nuxt-ui-neutral', appConfig.ui.colors.neutral)
  },
})

const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors]
const primaryColors = Object.keys(omit(colors, colorsToOmit as (keyof typeof colors)[]))
const primary = computed({
  get() {
    return appConfig.ui.colors.primary
  },
  set(option) {
    appConfig.ui.colors.primary = option
    window.localStorage.setItem('nuxt-ui-primary', appConfig.ui.colors.primary)
    setBlackAsPrimary(false)
  },
})

const radiuses = [0, 0.25, 0.375, 0.5, 1, 1.5]
const radius = computed({
  get() {
    return appConfig.theme.radius
  },
  set(option) {
    appConfig.theme.radius = option
    window.localStorage.setItem('nuxt-ui-radius', String(appConfig.theme.radius))
  },
})

const modes = [
  { icon: 'i-lucide-sun', label: 'light' },
  { icon: 'i-lucide-moon', label: 'dark' },
  { icon: 'i-lucide-monitor', label: 'system' },
]
const mode = computed({
  get() {
    return colorMode.value
  },
  set(option) {
    colorMode.preference = option
  },
})

function setBlackAsPrimary(value: boolean) {
  appConfig.theme.blackAsPrimary = value
  window.localStorage.setItem('nuxt-ui-black-as-primary', String(value))
}

const activeTab = ref('mode')
</script>

<template>
  <!-- Inline mode: tabs -->
  <div
    v-if="props.inline"
    class="border-item-6 overflow-hidden rounded-lg border"
  >
    <div class="px-4 pt-4 pb-2 text-lg font-semibold">
      {{ t('theme.title') }}
    </div>

    <div class="px-4 pb-2">
      <UiTabsScroll>
        <UiTabsItemPill
          :isActive="activeTab === 'mode'"
          variant="outline"
          @click="activeTab = 'mode'"
        >
          {{ t('theme.picker.theme') }}
        </UiTabsItemPill>
        <UiTabsItemPill
          variant="outline"
          :isActive="activeTab === 'primary'"
          @click="activeTab = 'primary'"
        >
          {{ t('theme.picker.primary') }}
        </UiTabsItemPill>
        <UiTabsItemPill
          variant="outline"
          :isActive="activeTab === 'neutral'"
          @click="activeTab = 'neutral'"
        >
          {{ t('theme.picker.neutral') }}
        </UiTabsItemPill>
        <UiTabsItemPill
          variant="outline"
          :isActive="activeTab === 'radius'"
          @click="activeTab = 'radius'"
        >
          {{ t('theme.picker.radius') }}
        </UiTabsItemPill>
      </UiTabsScroll>
    </div>

    <!-- Theme mode -->
    <div v-if="activeTab === 'mode'" class="grid grid-cols-3 px-4 pb-4">
      <UiElement
        v-for="m in modes"
        :key="m.label"
        :isActive="colorMode.preference === m.label"
        @click="mode = m.label"
      >
        <template #leftIcon>
          <UIcon :name="m.icon" class="text-muted size-5" />
        </template>
        <span class="text-sm capitalize">{{ m.label }}</span>
      </UiElement>
    </div>

    <!-- Primary color -->
    <div v-if="activeTab === 'primary'" class="grid grid-cols-3 px-4 pb-4">
      <UiElement
        :isActive="appConfig.theme.blackAsPrimary"
        @click="setBlackAsPrimary(true)"
      >
        <template #leftIcon>
          <span class="inline-block size-5 rounded-full bg-black dark:bg-white" />
        </template>
        <span class="text-sm capitalize">Black</span>
      </UiElement>

      <UiElement
        v-for="color in primaryColors"
        :key="color"
        :isActive="!appConfig.theme.blackAsPrimary && primary === color"
        @click="primary = color"
      >
        <template #leftIcon>
          <span
            class="inline-block size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
            :style="{
              '--color-light': `var(--color-${color}-500)`,
              '--color-dark': `var(--color-${color}-400)`,
            }"
          />
        </template>
        <span class="text-sm capitalize">{{ color }}</span>
      </UiElement>
    </div>

    <!-- Neutral color -->
    <div v-if="activeTab === 'neutral'" class="grid grid-cols-3 px-4 pb-4">
      <UiElement
        v-for="color in neutralColors"
        :key="color"
        :isActive="neutral === color"
        @click="neutral = color"
      >
        <template #leftIcon>
          <span
            class="inline-block size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
            :style="{
              '--color-light': `var(--color-${color}-500)`,
              '--color-dark': `var(--color-${color}-400)`,
            }"
          />
        </template>
        <span class="text-sm capitalize">{{ color }}</span>
      </UiElement>
    </div>

    <!-- Radius -->
    <div v-if="activeTab === 'radius'" class="grid grid-cols-3 px-4 pb-4">
      <UiElement
        v-for="r in radiuses"
        :key="r"
        :isActive="radius === r"
        @click="radius = r"
      >
        <template #leftIcon>
          <UIcon name="i-lucide-square" class="text-muted size-5" :style="{ borderRadius: `${r * 4}px` }" />
        </template>
        <span class="text-sm">{{ r }}</span>
      </UiElement>
    </div>
  </div>

  <!-- Popover mode: button with popover -->
  <UPopover
    v-else
    :ui="{ content: 'w-72 px-6 py-4 flex flex-col gap-4' }"
  >
    <template #default="{ open }">
      <UTooltip :text="t('theme.color')">
        <UButton
          :aria-label="t('theme.color')"
          :variant="open ? 'soft' : 'ghost'"
          color="neutral"
          class="text-muted"
          icon="i-lucide-swatch-book"
          size="lg"
          square
        />
      </UTooltip>
    </template>

    <template #content>
      <fieldset>
        <legend class="mb-2 text-[11px] leading-none font-semibold">
          {{ t('theme.picker.primary') }}
        </legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <ThemePickerButton
            chip="primary"
            label="Black"
            :selected="appConfig.theme.blackAsPrimary"
            @click="setBlackAsPrimary(true)"
          >
            <template #leading>
              <span class="inline-block h-2 w-2 rounded-full bg-black dark:bg-white" />
            </template>
          </ThemePickerButton>

          <ThemePickerButton
            v-for="color in primaryColors"
            :key="color"
            :label="color"
            :chip="color"
            :selected="!appConfig.theme.blackAsPrimary && primary === color"
            @click="primary = color"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-[11px] leading-none font-semibold">
          {{ t('theme.picker.neutral') }}
        </legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <ThemePickerButton
            v-for="color in neutralColors"
            :key="color"
            :label="color"
            :chip="color"
            :selected="neutral === color"
            @click="neutral = color"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-[11px] leading-none font-semibold">
          {{ t('theme.picker.radius') }}
        </legend>

        <div class="-mx-2 grid grid-cols-5 gap-1">
          <ThemePickerButton
            v-for="r in radiuses"
            :key="r"
            :label="String(r)"
            class="justify-center px-0"
            :selected="radius === r"
            @click="radius = r"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-[11px] leading-none font-semibold">
          {{ t('theme.picker.theme') }}
        </legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <ThemePickerButton
            v-for="m in modes"
            :key="m.label"
            v-bind="m"
            :selected="colorMode.preference === m.label"
            @click="mode = m.label"
          />
        </div>
      </fieldset>
    </template>
  </UPopover>
</template>
