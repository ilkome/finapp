<script lang="ts">
import useFilter from '~/modules/filter/useFilter'

export default defineComponent({
  props: {
    id: { type: String, required: true },
    showBase: { type: Boolean, default: true },
    vertical: { type: String, default: 'left' },
    size: { type: String, default: null },
    activeItemId: { type: String, default: null },
  },

  setup(props) {
    const { $store } = useNuxtApp()
    const { setFilterWalletsId } = useFilter()

    const onClickFilterWallet = () => {
      setFilterWalletsId(props.id)
      $store.dispatch('ui/setActiveTabStat', 'details')
    }

    return {
      onClickFilterWallet,
    }
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
.py-2.px-5.gap-x-3.items-center.flex.cursor-pointer(
  :class="[{ _active: activeItemId === id }, 'hocus_bg-gray-200 dark_hocus_bg-neutral-800']"
  @click="handleClick"
)
  //- Icon
  .w-6.h-6.flex-center.rounded-md.text-neutral-50.text-xs.leading-none(
    :style="{ background: wallet.color }"
    @click.stop="onClickFilterWallet"
  ) {{ wallet.name.substring(0, 2) }}

  .grow
    .py-1.items-center.flex
      .grow.text-xs.text-neutral-600(
        class="dark_text-neutral-400"
      ) {{ wallet.name }}

      Amount(
        :currency="wallet.currency"
        :showBase="showBase"
        :size="size"
        :value="wallet.total"
        :vertical="vertical"
        alwaysShowSymbol
      )

    div(class="h-[1px] bg-gray-200 dark_bg-neutral-800")
</template>
