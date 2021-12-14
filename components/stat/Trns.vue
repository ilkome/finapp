<script>
export default {}
</script>

<template lang="pug">
div
  .py-2
    .statTitle {{ $t('trns.inPeriodTitle') }}

  TrnsList(:size="50")
</template>
