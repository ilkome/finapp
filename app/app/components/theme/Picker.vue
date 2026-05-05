<script setup lang="ts">
import colors from 'tailwindcss/colors'

import { omit } from '#ui/utils'

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
const modeItems = computed(() => [
  { icon: 'i-lucide-sun', label: t('theme.light'), value: 'light' },
  { icon: 'i-lucide-moon', label: t('theme.dark'), value: 'dark' },
  { icon: 'i-lucide-monitor', label: t('theme.system'), value: 'system' },
])
const mode = computed({
  get() {
    return colorMode.value
  },
  set(option) {
    colorMode.preference = option
  },
})
const modePreference = computed({
  get() {
    return colorMode.preference
  },
  set(option) {
    colorMode.preference = option
  },
})
const selectedModeItem = computed(() =>
  modeItems.value.find(m => m.value === modePreference.value),
)

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const BLACK_PRIMARY = '__black__'
const primaryItems = computed(() => [
  { label: 'Black', value: BLACK_PRIMARY },
  ...primaryColors.map(c => ({ label: capitalize(c), value: c })),
])
const primarySelected = computed({
  get() {
    return appConfig.theme.blackAsPrimary ? BLACK_PRIMARY : primary.value
  },
  set(option) {
    if (option === BLACK_PRIMARY) {
      setBlackAsPrimary(true)
    }
    else {
      setBlackAsPrimary(false)
      primary.value = option
    }
  },
})

const neutralItems = computed(() => neutralColors.map(c => ({ label: capitalize(c), value: c })))

function setBlackAsPrimary(value: boolean) {
  appConfig.theme.blackAsPrimary = value
  window.localStorage.setItem('nuxt-ui-black-as-primary', String(value))
}
</script>

<template>
  <!-- Inline mode: dropdowns inside a settings card -->
  <UiSettingsCard
    v-if="props.inline"
    :title="t('theme.title')"
  >
    <div class="grid gap-3">
      <!-- Theme mode -->
      <div class="flex flex-col items-start gap-1">
        <span class="text-muted text-xs">{{ t('theme.picker.theme') }}</span>
        <USelectMenu
          v-model="modePreference"
          :items="modeItems"
          valueKey="value"
          :searchInput="false"
        >
          <template #leading>
            <UIcon :name="selectedModeItem?.icon" class="size-5" />
          </template>
          <template #item-leading="{ item }">
            <UIcon :name="item.icon" class="size-5" />
          </template>
        </USelectMenu>
      </div>

      <!-- Primary color -->
      <div class="flex flex-col items-start gap-1">
        <span class="text-muted text-xs">{{ t('theme.picker.primary') }}</span>
        <USelectMenu
          v-model="primarySelected"
          :items="primaryItems"
          valueKey="value"
          :searchInput="false"
        >
          <template #leading>
            <span
              v-if="primarySelected === BLACK_PRIMARY"
              class="size-5 rounded-full bg-black dark:bg-white"
            />
            <span
              v-else
              class="size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
              :style="{
                '--color-light': `var(--color-${primarySelected}-500)`,
                '--color-dark': `var(--color-${primarySelected}-400)`,
              }"
            />
          </template>
          <template #item-leading="{ item }">
            <span
              v-if="item.value === BLACK_PRIMARY"
              class="size-5 rounded-full bg-black dark:bg-white"
            />
            <span
              v-else
              class="size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
              :style="{
                '--color-light': `var(--color-${item.value}-500)`,
                '--color-dark': `var(--color-${item.value}-400)`,
              }"
            />
          </template>
        </USelectMenu>
      </div>

      <!-- Neutral color -->
      <div class="flex flex-col items-start gap-1">
        <span class="text-muted text-xs">{{ t('theme.picker.neutral') }}</span>
        <USelectMenu
          v-model="neutral"
          :items="neutralItems"
          valueKey="value"
          :searchInput="false"
        >
          <template #leading>
            <span
              class="size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
              :style="{
                '--color-light': `var(--color-${neutral}-500)`,
                '--color-dark': `var(--color-${neutral}-400)`,
              }"
            />
          </template>
          <template #item-leading="{ item }">
            <span
              class="size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
              :style="{
                '--color-light': `var(--color-${item.value}-500)`,
                '--color-dark': `var(--color-${item.value}-400)`,
              }"
            />
          </template>
        </USelectMenu>
      </div>

      <!-- Radius -->
      <div class="flex flex-col items-start gap-1">
        <span class="text-muted text-xs">{{ t('theme.picker.radius') }}</span>
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
      </div>
    </div>
  </UiSettingsCard>

  <!-- Popover mode: button with popover -->
  <UPopover
    v-else
    :ui="{ content: 'w-72 px-6 py-4 flex flex-col gap-4 max-h-[var(--reka-popper-available-height,80dvh)] overflow-y-auto' }"
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
    </template>
  </UPopover>
</template>
