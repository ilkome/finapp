<template lang="pug">
.pb-8.text-6xl.font-extrabold.font-secondary.tracking-wide.text-gray-600.dark_text-neutral-200.appName.font-nunito.
  {{ $t('appName') }}
</template>

<style lang="stylus" scoped>
.appName
  &:first-letter
    color var(--c-blue-3)
</style>
