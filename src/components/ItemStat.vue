<template lang="pug">
div(
  :class="className"
  @click.prevent.stop="onClickItem"
)
  .itemStat__in
    .itemStat__icon(@click.stop="onClickIcon")
      .icon._big._link(
        :class="{ _small: isChild }"
        :style="`background: ${item.color}`"
      ): div(:class="item.icon")

    .itemStat__content
      .itemStat__text
        .itemStat__name {{ item.name }}
        .itemStat__price(:class="{expense: type === 'expenses', income: type === 'incomes'}") {{ formatMoney(item.total) }}

      .itemStat__graph
        .itemStat__graph__in(
          :class="{_expense: type === 'expenses', _income: type === 'incomes'}"
          :style="grpahWidth",
        )

  slot(name="inside")
</template>

<script>
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  props: {
    idsOfOpenedCategories: {
      type: Array,
      required: true
    },
    item: {
      type: Object,
      required: true
    },
    trns: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    isChild: {
      type: Boolean
    },
    biggestValue: {
      type: Number,
      default: 0
    }
  },

  computed: {
    grpahWidth() {
      const width = this.item.total / this.biggestValue * 100
      const renderWidth = width > 0 ? width : 0
      return { width: `calc(${renderWidth}%)` }
    },
    className() {
      return {
        'itemStat': !this.isChild,
        'itemStatChild': this.isChild,
        _opened: this.idsOfOpenedCategories.indexOf(this.item.id) !== -1
      }
    }
  },

  methods: {
    onClickIcon() {
      this.$emit('setFilterCategory', this.item.category)
    },
    onClickItem(id) {
      this.$emit('onClickItem', this.item.id)
    }
  }
}
</script>
