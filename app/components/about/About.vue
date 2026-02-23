<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div>
    <UiTitleSection class="pb-4">
      {{ t('about.title') }}
    </UiTitleSection>

    <div class="grid gap-8 pb-3">
      <div>
        <div class="text-font-4 pb-4 text-xs">
          {{ t('about.author') }}
        </div>
        <div class="text-font-2 font-secondary text-sm leading-none">
          ilkome
        </div>
      </div>

      <div>
        <div class="text-font-4 pb-4 text-xs">
          {{ t('about.thanks') }}
        </div>
        <div class="text-font-2 font-secondary text-sm leading-none">
          TheCarolissy, TihomirovPro
        </div>
      </div>
    </div>
  </div>
</template>
