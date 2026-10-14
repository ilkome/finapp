<!-- The handle fills the row's height on its left edge, as in the stat config rows: hosts lay the row out
     with `items-stretch` and own its background. -->
<template>
  <div
    class="sortHandle flex w-12 shrink-0 cursor-grab items-center justify-center self-stretch rounded-l-sm text-muted hover:bg-accented active:cursor-grabbing"
    data-reka-swipe-ignore
    :aria-label="$t('base.sort')"
  >
    <Icon name="lucide:grip-vertical" size="20" />
  </div>
</template>
