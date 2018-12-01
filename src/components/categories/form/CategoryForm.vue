<script>
import { focus } from 'vue-focus'
import { db } from '@/firebase'
import { createId } from '@/utils/id'
import colors from '@/components/ui/store/colors'
import icons from '@/components/ui/store/icons'

import Button from '@/components/shared/button/Button'
import Checkbox from '@/components/shared/inputs/Checkbox'
import CategoriesView from '@/components/categories/list/CategoriesView'
import ModalBottom from '@/components/modal/ModalBottom'
import ModalButton from '@/components/modal/ModalButton'

export default {
  components: {
    Button,
    Checkbox,
    CategoriesView,
    ModalBottom,
    ModalButton
  },

  directives: { focus },

  data () {
    return {
      showParents: false,
      showColors: false,
      showIcons: false,
      filter: null,
      category: {
        color: '',
        icon: '',
        name: null,
        parentId: 0,
        showInLastUsed: true,
        showStat: true
      }
    }
  },

  computed: {
    categoryId () {
      return this.$store.state.categories.editId
    },

    selectedIcons () {
      if (this.filter) return icons.filter(icon => icon.includes(this.filter.toLowerCase()))
      return icons
    }
  },

  watch: {
    categoryId: {
      handler (categoryId) {
        if (categoryId) {
          this.category = {
            ...this.category,
            ...this.$store.state.categories.items[this.categoryId]
          }
        }
      },
      immediate: true
    }
  },

  created () {
    this.colors = colors
    this.icons = icons
    if (!this.$store.state.categories.editId) {
      this.category.icon = `mdi ${icons[Math.floor(Math.random() * icons.length)]}`
      this.category.color = colors[Math.floor(Math.random() * colors.length)]
    }
  },

  beforeDestroy () {
    this.$store.commit('setCategoryEditId', null)
  },

  methods: {
    handleColorSelect (color) {
      this.category.color = color
      this.showColors = false
    },

    handleIconSelect (icon) {
      this.category.icon = `mdi ${icon}`
      this.showIcons = false
    },

    handleParenCategorySelect (categoryId) {
      this.category.parentId = categoryId
      this.showParents = false
    },

    handleSubmit () {
      if (this.validateForm()) {
        const uid = this.$store.state.user.user.uid
        const id = this.categoryId || createId()

        const categoriesValues = {
          color: this.category.color,
          icon: this.category.icon,
          name: this.category.name,
          parentId: this.category.parentId,
          showInLastUsed: this.category.showInLastUsed,
          showStat: true
        }

        db.ref(`users/${uid}/categories/${id}`).set(categoriesValues)

        this.$store.commit('setCategoryEditId', null)
        this.$store.dispatch('setActiveTab', 'categories')

        if (this.$listeners.callback) this.$listeners.callback()
      }
    },

    validateForm () {
      const categories = this.$store.state.categories.items
      if (!this.category.name) {
        this.$notify({
          group: 'main',
          title: '😮',
          text: 'Write category name'
        })
        return false
      }

      for (const categoryId in categories) {
        if (categories[categoryId].name === this.category.name && categories[categoryId].parentId === this.category.parentId) {
          if (this.categoryId) {
            if (this.categoryId !== categoryId) {
              this.$notify({
                group: 'main',
                title: '😮',
                text: 'Category with same name is exist'
              })
              return false
            }
          } else {
            this.$notify({
              group: 'main',
              title: '😮',
              text: 'Category with same name is exist'
            })
            return false
          }
        }
      }

      return true
    }
  }
}
</script>

<template lang="pug">
.component
  .form
    h1.component__title
      template(v-if="!categoryId") Create new category
      template(v-else) Edit category

    .form-line._text
      .inputText
        input(
          type="text"
          placeholder="Write category name..."
          v-model="category.name"
          v-focus.lazy="$store.state.ui.pc"
        ).inputText__value
        .inputText__label Category name

    .form__btns
      .form__btns__i
        .form-line(@click="showColors = true")
          .inputModal._flex
            .inputModal__value: .inputModal__color(:style="{ background: category.color }")
            .inputModal__label Color

      .form__btns__i
        .form-line(@click="showIcons = true")
          .inputModal._flex
            .inputModal__icon: div(:class="category.icon", :style="{ color: category.color }")
            .inputModal__label Icon

      //- can not change root category if inside this category already has some categories
      template(v-if="$store.getters.getChildCategoriesIds(categoryId).length === 0 && $store.getters.hasCategories")
        .form__btns__i._full
          .form-line(@click="showParents = true")
            .inputModal._flex
              .inputModal__content
                template(v-if="category.parentId !== 0")
                  .inputModal__icon
                    div(
                      :class="$store.state.categories.items[category.parentId].icon"
                      :style="{ color: $store.state.categories.items[category.parentId].color }"
                    )
                  .inputModal__name {{ $store.state.categories.items[category.parentId].name }}
                template(v-else)
                  .inputModal__icon: .mdi.mdi-chart-bubble
                  .inputModal__name No parent
              .inputModal__label Parent category

    template(v-if="$store.getters.getChildCategoriesIds(categoryId).length === 0")
      .form-line._p0._clean
        Checkbox(
          v-model="category.showInLastUsed"
          title="Show in last used categories"
        )

    .form__actions
      Button(
        className="_blue"
        title="Save category"
        v-on:onClick="handleSubmit"
      )

  //- colors
  ModalBottom(
    :center="true"
    :show="showColors"
    title="Category color"
    v-on:onClose="showColors = false")
    .inputText
      .inputText__colors
        .colors
          .colorItem(
            :class="{ _active: category.color === color }"
            :style="{ background: color }"
            @click="handleColorSelect(color)"
            v-for="color in colors"
          )
    .customColor
      .customColor__title Select your color
      input.customColor__value(v-model="category.color" type="color")

  //- parents
  ModalBottom(
    :center="true"
    :show="showParents"
    title="Parent category"
    v-on:onClose="showParents = false")
    .padding-bottom
      ModalButton(
        name="No parent"
        icon="mdi mdi-chart-bubble"
        v-on:onClick="() => handleParenCategorySelect(0)")
    CategoriesView(
      :noPadding="true"
      :ids="$store.getters.categoriesForBeParent.filter(cId => cId !== categoryId)"
      v-on:onClick="handleParenCategorySelect")

  //- icons
  ModalBottom(
    :center="true"
    :show="showIcons"
    title="Category icon"
    v-on:onClose="showIcons = false")
    .form-line._text
      .inputText
        input.inputText__value(
          type="text"
          placeholder="Filter icons..."
          v-model="filter"
          v-focus.lazy="showIcons")
        .inputText__label Filter
    .inputIcons
      .inputIcons__item(
        :class="{ _active: category.icon === `mdi ${icon}` }"
        @click="handleIconSelect(icon)"
        v-for="icon in selectedIcons")
        div(:class="`mdi ${icon}`")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.customColor
  margin (- $m7)
  margin-top 0
  padding $m7
  background var(--c-bg-1)

  &__title
    padding-bottom $m6
    color var(--c-font-4)

  &__value
    width 100%
    height 40px
    margin 0
    padding 0
    border 0

.padding-bottom
  padding-bottom $m8

.component
  width 100%
  padding $m9

  @media $media-phone
    margin 0 auto

  &__title
    padding-bottom $m10

.form
  @media $media-laptop
    max-width 380px

.form__actions
  @media $media-phone
    text-align center

.form__btns
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m9
  grid-row-gap $m9
  padding-bottom $m9

  @media $media-laptop
    grid-column-gap $m10
    grid-row-gap $m10
    padding-bottom $m10

  &__i._full
    grid-column 1 / -1

  .form-line
    display flex
    align-items center
    justify-content center
    height 100%
    height 56px
    margin-bottom 0

.inputModal
  &._flex
    flex 1
    display flex
    align-items center
    justify-content space-between

  &__content
    display flex

  &__label
    margin 0
    padding 0
    font-size 10px
</style>

<style lang="stylus">
@import "~@/stylus/variables/media"

.dashboard .component
  .categories__list
    @media $media-laptop
      grid-template-columns repeat(3,  1fr)
</style>
