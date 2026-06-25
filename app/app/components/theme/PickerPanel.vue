<script setup lang="ts">
import colors from 'tailwindcss/colors'

import { omit } from '#ui/utils'

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

const radiuses = [0, 0.25, 0.375, 0.5]
const radiusItems = radiuses.map(r => ({ label: String(r), value: r }))
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
</script>

<template>
  <div class="flex flex-col gap-4">
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
            <span class="inline-block size-2 rounded-full bg-black dark:bg-white" />
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

      <USelectMenu
        v-model="radius"
        :items="radiusItems"
        valueKey="value"
        :searchInput="false"
      >
        <template #leading>
          <span
            class="bg-elevated size-5"
            :style="{ borderRadius: `${radius}rem` }"
          />
        </template>
        <template #item-leading="{ item }">
          <span
            class="bg-elevated size-5"
            :style="{ borderRadius: `${item.value}rem` }"
          />
        </template>
      </USelectMenu>
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
  </div>
</template>
