<template lang="pug">
.rightBar(
  :class="{ _active: $store.state.categories.create }"
)
  .rightBar__overlay(
    @click="$store.commit('toogleCategoryCreate', 'hide')"
  )

  .rightBar__wrap
    .sidebar__close(@click="$store.commit('toogleCategoryCreate', 'hide')")
      .sidebar__close-title Create category

    .rightBar__in
      .rightBar__main
        .rightBar__main__in
          .form
            .form__table
              .form__table__cell._name
                .input
                  input.input__field(
                    v-model="values.name"
                    v-focus.lazy="true",
                    name="name"
                    type="text"
                    placeholder="Write category name"
                  )
                  .input__label Name

              .form__table__cell._color
                input.input__field._color(
                  v-model="values.color"
                  v-on:input="setColor($event.target.value)"
                  type="color" name="color")

              .form__table__cell._icon
                .icon._link._small(
                  :style="`background: ${values.color}`"
                  @click.prevent="toogleIconsPop()"
                )
                  template(v-if="selectedIcon")
                    .icon__i(:class="selectedIcon")
                  template(v-else)
                    .icon__i(class="fa fa-question-circle-o")
                  .icon__label
                    .icon__label__in Select icon

            .checkbox
              input#showStat.checkbox__none(type="checkbox" v-model="values.showStat")
              label.checkbox__input(for="showStat")
              label.checkbox__label(for="showStat") Show stat on Dashboard

            //- Categories
            .trnForm__icons
              .trnForm__subTitle
                .trnForm__subTitle__flex
                  //- It's parent
                  template(v-if="values.parentId !== 0")
                    .icon._link._small(
                      :style="{ background: selectedParentCategory.color }"
                      :title="selectedParentCategory.name"
                    )
                      .icon__i(:class="selectedParentCategory.icon")
                      .icon__label
                        .icon__label__in {{ selectedParentCategory.name }}
                    .name {{ selectedParentCategory.name }}
                  template(v-else)
                    .icon._link._small
                      .icon__i(class="fa fa-question-circle-o")
                      .icon__label
                        .icon__label__in Root category
                    .name Root category

              .iconsGroup
                .iconsGroup__el
                  .icon._link(
                    :class="{_active: (values.parentId === 0)}",
                    @click.prevent="selectParent(null)",
                    @keyup.enter.prevent="selectParent(null)",
                    title="Root category",
                    aria-checked="false", tabindex="0")
                    .icon__i(class="fa fa-question-circle-o")
                    .icon__label
                      .icon__label__in Root category

                template(v-if="showedCategories.length")
                  .iconsGroup__el(v-for="category in showedCategories")
                    .icon._link._small(
                      @click.prevent="selectParent(category)"
                      @keyup.enter.prevent="selectParent(category)"
                      :style="{ background: category.color }"
                      :title="category.name"
                    )
                      .icon__i(:class="category.icon")
                      .icon__label
                        .icon__label__in {{ category.name }}

                  .iconsGroup__el
                    .icon._link._more._small(
                      @click.prevent="toogleCategoriesPop()",
                      @keyup.enter.prevent="toogleCategoriesPop()",
                      v-shortkey="['alt', 'arrowup']",
                      @shortkey="toogleCategoriesPop()",
                      aria-checked="false", tabindex="0")
                      .mdi.mdi-dots-horizontal
                      .icon__label
                        .icon__label__in Show all categories

            .trnForm__actions__btn.mb20(@click.prevent="addCategory") Create

      //- Categories popup block
      //------------------------------------------------
      transition(name="trnFormAnimation")
        .trnForm__categories(
          v-if="showCategoriesPop"
          v-shortkey="['alt', 'arrowdown']"
          @shortkey="toogleShowCategories()"
        )

          .sidebar__close(@click="toogleCategoriesPop")
            .sidebar__close-title Select category
            .sidebar__close-icon: .mdi.mdi-plus

          .rightBar__parentCategoryPop
            .rightBar__main__in
              template(v-for="category in showedCategories")
                .itemList
                  .itemList__content(@click.prevent="selectParent(category)")
                    .itemList__icon
                      .icon._link(:style="`background: ${category.color}`")
                        .icon__pic: div(:class="category.icon")
                    .itemList__name
                      div {{ category.name }}

      //- Icons popup block
      //------------------------------------------------
      transition(name="trnFormAnimation")
        .trnForm__categories(
          v-if="showIconsPop"
        )
          .sidebar__close(@click="toogleIconsPop")
            .sidebar__close-title Select icon
            .sidebar__close-icon: .mdi.mdi-plus

          .filter
            input(
              type="text",
              v-model.trim="iconFilter",
              v-focus.lazy="showIconsPop && !$store.state.isMobile",
              placeholder="Search"
            ).filter__input
            template(v-if="iconFilter !== ''")
              .filter__btns
                .filter__btn._edit(@click.prevent="iconFilter = ''")
                  .fa.fa-eraser

          .rightBar__iconsPop
            .rightBar__main__in
              template(v-if="iconFilter.length >= 2 && searchedIcons.length === 0")
                div Nothing found

              CategoryColor(v-on:setColor="setColor")

              //- .input
                input.input__field(
                  v-model="values.icon"
                  v-focus.lazy="true",
                  name="icon"
                  type="text"
                  placeholder="Category icon"
                )
                .input__label Icon

              .iconsGroup
                template(v-for="icon in searchedIcons")
                  .iconsGroup__el
                    .icon._link(
                      @click.prevent="selectIcon(icon)"
                      :style="`background: ${values.color}`"
                    )
                      .icon__i(:class="`fa fa-${icon.id}`")
                      .icon__label
                        .icon__label__in {{ icon.name }}
</template>

<script>
import Fuse from 'fuse.js'
import { mixin } from 'vue-focus'
import { mapGetters } from 'vuex'
import icons from '../../libs/icons'
import CategoryList from './CategoryList.vue'
import CategoryColor from './CategoryColor.vue'

const defaultIcon = 'fa fa-industry'
const defaultColor = '#242424'

export default {
  mixins: [mixin],
  components: { CategoryList, CategoryColor },

  data() {
    return {
      iconFilter: '',
      selectedParentCategory: null,
      selectedIcon: null,
      showCategoriesPop: false,
      showedIcons: icons,
      showIconsPop: false,
      iconOrColorTouched: false,
      values: {
        name: '',
        color: defaultColor,
        icon: defaultIcon,
        parentId: 0,
        showStat: false
      },
      error: null
    }
  },

  computed: {
    ...mapGetters(['trns', 'categories']),
    showedCategories() {
      return this.categories.filter(cat => cat.parentId === 0)
    },
    searchedIcons() {
      if (this.iconFilter.length >= 2) {
        const searchOptions = {
          shouldSort: true,
          threshold: 0.3,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['name', 'filter', 'categories']
        }

        const fuse = new Fuse(icons, searchOptions)
        const searchResults = fuse.search(this.iconFilter)
        return searchResults
      }
      return icons
    }
  },

  methods: {
    async addCategory() {
      this.error = null

      const formatedValues = {
        name: this.values.name.trim(),
        color: this.values.color,
        icon: this.values.icon,
        parentId: this.values.parentId ? this.values.parentId : 0,
        showStat: this.values.showStat ? this.values.showStat : false
      }

      if (!formatedValues.name) {
        this.error = 'Please write category name'
        this.$store.commit('closeLoader')
        return
      }

      const sameCategory = this.$store.state.categories.all
        .filter(category =>
          category.name === formatedValues.name &&
          category.icon === formatedValues.icon &&
          category.color === formatedValues.color &&
          category.showStat === formatedValues.showStat &&
          category.parentId === formatedValues.parentId)

      if (sameCategory.length) {
        this.error = 'Same category name is already exist!'
        this.$store.commit('closeLoader')
        return
      }

      // Ready to go
      this.$store.commit('showLoader')
      await this.$store.dispatch('addCategory', formatedValues)
      this.$store.commit('toogleCategoryCreate', 'hide')
      this.$store.commit('closeLoader')
      this.$notify({
        group: 'foo',
        title: 'Succesed',
        text: 'Category was created.',
        type: 'success'
      })
    },
    selectParent(category) {
      if (category) {
        this.values.parentId = category.id
        if (!this.iconOrColorTouched) {
          this.values.color = category.color
          this.selectedIcon = category.icon
        }
      } else {
        this.values.parentId = 0
        if (!this.iconOrColorTouched) {
          this.values.color = defaultColor
          this.selectedIcon = defaultIcon
        }
      }
      this.selectedParentCategory = category
      this.showCategoriesPop = false
    },
    selectIcon(icon) {
      this.iconOrColorTouched = true
      if (icon) {
        this.values.icon = `fa fa-${icon.id}`
        this.selectedIcon = `fa fa-${icon.id}`
      }
      this.showIconsPop = false
    },
    setColor(color) {
      this.iconOrColorTouched = true
      this.values.color = color
    },
    toogleCategoriesPop() {
      this.showCategoriesPop = !this.showCategoriesPop
    },
    toogleIconsPop() {
      this.showIconsPop = !this.showIconsPop
    }
  }
}
</script>
