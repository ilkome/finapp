<template>
  <div
    class="sortHandle flex w-10 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted hover:bg-accented active:cursor-grabbing"
    :aria-label="$t('base.sort')"
  >
    <Icon name="lucide:grip-vertical" size="20" />
  </div>
</template>
