<template lang="pug">
.itemStat._link._small._categoryStat(:class="className")
  .itemStat__in(@click.prevent.stop="onClickItem")
    .itemStat__icon(@click.stop="onClickIcon")
      .icon._link(:style="`background: ${item.color}`")
        div(:class="item.icon")
    .itemStat__content
      .itemStat__text
        .itemStat__name {{ item.name }}
        .itemStat__price.sum {{ formatMoney(item.total) }}
      .itemStat__graph
        .itemStat__graph__in(:style="grpahWidth", :class="{_expense: type === 'expenses', _income: type === 'incomes'}")

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
    }
  },

  computed: {
    grpahWidth() {
      const width = this.item.total / this.trns[0].total * 100
      const renderWidth = width > 0 ? width : 0
      return { width: `calc(${renderWidth}%)` }
    },
    className() {
      return {
        _child: this.isChild,
        _opened: this.idsOfOpenedCategories.indexOf(this.item.id) !== -1
      }
    }
  },

  methods: {
    onClickIcon() {
      this.$emit('onClickIcon', this.item.category.id)
    },
    onClickItem(id) {
      this.$emit('onClickItem', this.item.id)
    }
  }
}
</script>
