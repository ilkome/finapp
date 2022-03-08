<script lang="ts">
export default defineComponent({
  props: {
    id: { type: String, required: true },
    showBase: { type: Boolean, default: true },
    vertical: { type: String, default: 'left' },
    size: { type: String, default: null },
    activeItemId: { type: String, default: null },
  },

  computed: {
    wallet() {
      return {
        ...this.$store.state.wallets.items[this.id],
        total: this.$store.getters['wallets/walletsTotal'][this.id].base,
      }
    },
  },

  methods: {
    handleClick() {
      if (this.$listeners.onClick)
        this.$listeners.onClick(this.id)
    },
  },
})
</script>

<template lang="pug">
.walletItemGrid.p-2.rounded-md(
  :class="{ _active: activeItemId === id }"
  @click="handleClick"
)
  .walletItemGridActive(v-if="activeItemId === id")
  .gap-x-3.flex
    .text-neutral-50.text-xs.leading-none.w-6.h-6.rounded-md.justify-center.items-center.flex(
      :style="{ background: wallet.color }"
      class="mt-[2px]"
    ) {{ wallet.name.substring(0, 2) }}

    div
      .text-sm.text-neutral-500(class="dark_text-neutral-400") {{ wallet.name }}
      Amount(
        :currency="wallet.currency"
        :showBase="showBase"
        :size="size"
        :value="wallet.total"
        :vertical="vertical"
        alwaysShowSymbol
      )
</template>

<style lang="stylus">
.sidebar .walletItemGrid
  background none

.walletItemGrid
  cursor pointer
  position relative
  background var(--c-item-bg-main)
  anim()

  +media-hover()
    background var(--c-item-bg-hover)

.walletItemGridActive
  position absolute
  top $m6
  right $m5
  display flex
  align-items center
  justify-content center
  width 8px
  height 8px
  background var(--c-blue-1)
  border-radius 50%
</style>
