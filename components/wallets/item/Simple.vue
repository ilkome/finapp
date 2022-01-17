<script lang="ts">
export default defineComponent({
  props: {
    id: { type: String, required: true },
    showBase: { type: Boolean, default: true },
    vertical: { type: String, default: 'left' },
    size: { type: String, default: null },
    activeItemId: { type: String, default: null }
  },

  computed: {
    wallet () {
      return {
        ...this.$store.state.wallets.items[this.id],
        total: this.$store.getters['wallets/walletsTotal'][this.id].base
      }
    }
  },

  methods: {
    handleClick () {
      if (this.$listeners.onClick)
        this.$listeners.onClick(this.id)
    }
  }
})
</script>

<template lang="pug">
.bg-main.py-2.px-5.gap-x-3.items-center.flex(
  :class="{ _active: activeItemId === id }"
  @click="handleClick"
)
  .text-neutral-50.text-xs.leading-none.w-6.h-6.rounded-md.justify-center.items-center.flex(
    :style="{ background: wallet.color }"
  ) {{ wallet.name.substring(0, 2) }}

  .grow
    .py-1.items-center.flex
      .grow.text-xs.text-neutral-500(class="dark:text-neutral-400") {{ wallet.name }}

      Amount(
        :alwaysShowSymbol="true"
        :currency="wallet.currency"
        :showBase="showBase"
        :size="size"
        :value="wallet.total"
        :vertical="vertical"
      )

    .line
</template>

<style lang="stylus">
.bg-main
  +media-hover()
    background var(--c-item-bg-hover)

.line
  height 1px
  background var(--c-bg-6);
</style>
