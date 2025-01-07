<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const { t } = useI18n()
</script>

<template>
  <a
    :class="getStyles('item', ['link', 'rounded'])"
    class="flex-center px-5 py-2"
    href="https://ilko.me"
  >
    {{ t('madeBy.text') }}
    <Icon
      class="mx-2 animate-[heartbeat_3s_ease-in-out_infinite] text-2xl text-[rgb(210,0,20)]"
      name="mdi:heart"
    />
    {{ t('madeBy.name') }}
  </a>
</template>

<style>
@keyframes heartbeat {
  0% {
    transform: scale(0.75);
  }
  20% {
    transform: scale(1);
  }
  40% {
    transform: scale(0.75);
  }
  60% {
    transform: scale(1.1);
  }
  80% {
    transform: scale(0.75);
  }
  100% {
    transform: scale(0.75);
  }
}
</style>

<i18n lang="yaml">
en:
  madeBy:
    text: Made with
    name: by Ilya Komichev
ru:
  madeBy:
    text: Разработал
    name: Илья Комичев
</i18n>
