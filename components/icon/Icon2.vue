<script>
export default {
  props: {
    background: { type: String, required: true },
    icon: { type: String, required: true }
  }
}
</script>

<template lang="pug">
.text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
  :style="{ background: background }"
  @click="event => $emit('click', event)"
): div(:class="icon")
</template>
