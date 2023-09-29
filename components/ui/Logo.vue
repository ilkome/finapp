<template lang="pug">
.logo.pb-8.text-6xl.font-extrabold.font-secondary.tracking-wide.text-gray-600.dark_text-neutral-200.font-nunito.
  {{ $t('appName') }}
</template>

<style lang="stylus" scoped>
.logo
  &:first-letter
    color var(--c-blue-3)
</style>
