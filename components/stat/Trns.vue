<template lang="pug">
.my-4
  .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('trns.inPeriodTitle') }}

  .md_max-w-none(class="max-w-[420px]")
    TrnsList(:size="12")
</template>
