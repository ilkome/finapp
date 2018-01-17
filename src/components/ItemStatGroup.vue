<template lang="pug">
.itemStatGroup
  template(v-if="!$store.state.isMobile")
    //- .moneyBlock
    //-   .moneyBlock__line
    //-     .moneyTitle(:class="type")
    //-       template(v-if="type === 'expenses'") Expences
    //-       template(v-else="type === 'incomes'") Incomes

    //- SummaryShort(
    //-   :type="type"
    //-   :trns="trnsList",
    //-   :view="type === 'expenses' ? 'dashboard-expenses' : 'dashboard-incomes'"
    //-   :selectedCategory="selectedCategory"
    //-   v-on:toogleOpenedCategories="$listeners.toogleOpenedCategories()"
    //- )

  slot(name="graph2")

  div
    //- Is trns there
    template(v-if="itemsStatList && itemsStatList.length > 0")
      //- Trns history in category without other child
      template(v-if="selectedCategory && itemsStatList.length === 1 && itemsStatList[0].category.parentId !== 0")
        .hey
          TrnItem(
            v-for="trn in itemsStatList[0].trns.slice(0, 100)"
            :trn="trn"
            :key="trn.id"
            view="small"
          )

      //- ItemStat
      template(v-if="itemsStatList.length")
        ItemStat(
          v-for="itemStat in itemsStatList"
          :key="itemStat.id"
          :idsOfOpenedCategories="$attrs.idsOfOpenedCategories"
          :item="itemStat"
          :trns="itemsStatList"
          :biggestValue="itemsStatList[0].total"
          :type="type"
          v-on:onClickItem="$listeners.toogleShowTrnsInCategory"
          v-on:setFilterCategory="$listeners.setFilterCategory"
        )

          //- Child categories
          template(slot="inside")
            template(v-if="$listeners.shouldOpenCategory(itemStat.id)")
              template(v-if="itemStat.category.showStat && type === 'expenses'")
                .itemStat__summary
                  SummaryShort(
                    :trns="itemStat.trns"
                    view="itemStat"
                    :selectedCategory="itemStat.category"
                    v-on:toogleOpenedCategories="$listeners.toogleOpenedCategories()"
                  )

              //- Child itemStat
              template(v-if="$listeners.getCategoryStat(itemStat.id, type).length")
                .itemStat__child
                  ItemStat(
                    v-for="itemStatChild in $listeners.getCategoryStat(itemStat.id, type)"
                    :key="itemStatChild.id"
                    :idsOfOpenedCategories="$attrs.idsOfOpenedCategories"
                    :item="itemStatChild"
                    :trns="$listeners.getCategoryStat(itemStat.id, type)"
                    :biggestValue="itemsStatList[0].total"
                    :type="type"
                    :isChild="true"
                    v-on:onClickItem="$listeners.toogleShowTrnsInCategory"
                    v-on:setFilterCategory="$listeners.setFilterCategory"
                  )
                    //- Child trns
                    template(slot="inside")
                      template(v-if="itemStatChild.category.showStat && type === 'expenses'")
                        .itemStat__summary
                          SummaryShort(
                            :trns="itemStatChild.trns"
                            view="itemStat"
                            :selectedCategory="itemStatChild.category"
                            v-on:toogleOpenedCategories="$listeners.toogleOpenedCategories()"
                          )
                      template(v-if="$listeners.shouldOpenCategory(itemStatChild.id)")
                        .itemStat__trns
                          TrnItem(
                            v-for="trn in itemStatChild.trns.slice(0, 20)",
                            :trn="trn",
                            :key="trn.id"
                            view="small"
                          )
              //- Root category without child categories
              template(v-else)
                .itemStat__trns._padding
                  TrnItem(
                    v-for="trn in itemStat.trns.slice(0, 20)",
                    :trn="trn",
                    :key="trn.id"
                    view="small"
                  )

  slot(name="graph")
</template>


<script>
import SummaryShort from './SummaryShort'
import TrnItem from './TrnItem'
import ItemStat from './ItemStat'

export default {
  components: { SummaryShort, TrnItem, ItemStat },
  props: {
    type: {
      type: String,
      required: true
    },
    trnsList: {
      type: Array,
      required: true
    },
    itemsStatList: {
      type: Array,
      required: true
    },
    selectedCategory: {
      type: Object
    }
  },

  computed: {
    chartCategoriesData() {
      return {
        categories: this.itemsStatList.slice(0, 7).map(d => d.name),
        series: [{
          name: this.type === 'expenses' ? 'Expenses' : 'Incomes',
          data: this.itemsStatList.slice(0, 7).map((d, idx) => ({
            y: d.total,
            color: d.color,
            name: d.name,
            icon: d.icon
          }))
        }]
      }
    }
  }
}
</script>
