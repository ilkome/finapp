<script>
export default {}
</script>

<template lang="pug">
div
  .py-2
    .statTitle {{ $t('trns.inPeriodTitle') }}

  div(class="max-w-[420px] md_max-w-none")
    TrnsList(:size="12")
</template>
