<template lang="pug">
.rightBar
  .rightBar__in
    .rightBar__main

      template(v-if="$store.state.categories.create")
        .trnFormToogle(
          @click.prevent.stop="$store.commit('toogleCategoryCreate', 'hide')",
          :class="{_active: $store.state.categories.create}"
        ): .trnFormToogle__icon: .trnFormToogle__icon__in +

      .rightBar__main__in
        .sidebar__close(@click="$store.commit('toogleCategoryCreate', 'hide')")
          .sidebar__close__name Create category
          .sidebar__close__icon: .fa.fa-plus

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
              .icon._link(
                :style="`background: ${values.color}`"
                @click.prevent="toogleIconsPop()"
              )
                template(v-if="selectedIcon")
                  .icon__i(:class="selectedIcon")
                template(v-else)
                  .icon__i(class="fa fa-question-circle-o")
                .icon__label Select icon

          //- Categories
          .trnForm__icons
            .trnForm__subTitle
              template(v-if="values.parentId")
                .name {{ selectedParentCategory.name }}
              template(v-else)
                .name Root category
              .label Parent category

            .iconsGroup
              .iconsGroup__el
                .icon._link(
                  :class="{_active: (values.parentId === 0)}",
                  @click.prevent="selectParent(null)",
                  @keyup.enter.prevent="selectParent(null)",
                  title="Root category",
                  aria-checked="false", tabindex="0")
                  .icon__i(class="fa fa-question-circle-o")
                  .icon__label Root category

              .iconsGroup__el(v-for="category in showedCategories")
                .icon._link(
                  :class="{_active: (selectedParentCategory && selectedParentCategory.id === category.id)}",
                  @click.prevent="selectParent(category)",
                  @keyup.enter.prevent="selectParent(category)",
                  :style="`background: ${category.color}`",
                  :title="category.name",
                  aria-checked="false", tabindex="0")
                  .icon__i(:class="category.icon")
                  .icon__label {{ category.name }}

              .iconsGroup__el
                .icon._link._more(
                  @click.prevent="toogleCategoriesPop()",
                  @keyup.enter.prevent="toogleCategoriesPop()",
                  v-shortkey="['alt', 'arrowup']",
                  @shortkey="toogleCategoriesPop()",
                  aria-checked="false", tabindex="0")
                  .mdi.mdi-dots-horizontal
                  .icon__label Show all categories

          template(v-if="error")
            .error.mb20 {{ error }}
          .trnForm__actions__btn.mb20(@click.prevent="addCategory") Create

      //- Categories popup block
      //------------------------------------------------
      transition(name="trnFormAnimation")
        .trnForm__categories(
          v-if="showCategoriesPop"
          v-shortkey="['alt', 'arrowdown']",
          @shortkey="toogleShowCategories()")

          .trnForm__categories__in
            .sidebar__close(@click="toogleCategoriesPop")
              .sidebar__close__name Select category
              .sidebar__close__icon: .fa.fa-plus

            div
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
          .trnForm__categories__in
            .sidebar__close(@click="toogleIconsPop")
              .sidebar__close__name Select icon
              .sidebar__close__icon: .fa.fa-plus

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

            template(v-if="iconFilter.length >= 2 && searchedIcons.length === 0")
              div Nothing found

            CategoryColor(v-on:setColor="setColor")
            .iconsGroup
              template(v-for="icon in searchedIcons")
                .iconsGroup__el
                  .icon._link(
                    @click.prevent="selectIcon(icon)"
                    :style="`background: ${values.color}`"
                  )
                    .icon__i(:class="`fa fa-${icon.id}`")
                    .icon__label {{ icon.name }}
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
        parentId: 0
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
      this.$store.commit('showLoader')
      this.error = null

      const formatedValues = {
        name: this.values.name.trim(),
        color: this.values.color,
        icon: this.values.icon,
        parentId: this.values.parentId ? this.values.parentId : 0
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
          category.parentId === formatedValues.parentId)

      if (sameCategory.length) {
        this.error = 'Same category name is already exist!'
        this.$store.commit('closeLoader')
        return
      }

      await this.$store.dispatch('addCategory', formatedValues)
      this.$store.commit('toogleCategoryCreate', 'hide')
      this.$store.commit('closeLoader')
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
