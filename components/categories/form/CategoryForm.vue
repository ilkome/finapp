<script>
import { db } from '~/services/firebaseConfig'
import generateId from '~/utils/id'
import colors from '~/assets/js/colors'
import icons from '~/assets/js/icons'

function random (icons) {
  return icons[Math.floor(Math.random() * icons.length)]
}

export default {
  data () {
    return {
      showParents: false,
      showColors: false,
      showIcons: false,
      applyChildColor: true,
      category: {
        color: '',
        icon: '',
        name: null,
        parentId: 0,
        showInLastUsed: true,
        showInQuickSelector: false,
        showStat: true
      }
    }
  },

  computed: {
    categoryId () {
      return this.$store.state.categories.editId
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
      this.category.icon = random(random(icons))
      this.category.color = colors[Math.floor(Math.random() * colors.length)]
    }
  },

  beforeDestroy () {
    this.$store.commit('categories/setCategoryEditId', null)
  },

  methods: {
    handleColorSelect (color) {
      this.category.color = color
      this.showColors = false
    },

    handleIconSelect (icon) {
      this.category.icon = icon
      this.showIcons = false
    },

    handleParenCategorySelect (categoryId) {
      const parentCategory = this.$store.state.categories.items[categoryId]
      if (parentCategory) {
        this.category.color = parentCategory.color
      }
      this.category.parentId = categoryId
      this.showParents = false
    },

    handleSubmit () {
      if (this.validateForm()) {
        const uid = this.$store.state.user.user.uid
        const id = this.categoryId || generateId()

        const categoriesValues = {
          color: this.category.color,
          icon: this.category.icon,
          name: this.category.name,
          parentId: this.category.parentId,
          showInLastUsed: this.category.showInLastUsed,
          showInQuickSelector: this.category.showInQuickSelector,
          showStat: true
        }

        db.ref(`users/${uid}/categories/${id}`).set(categoriesValues)

        if (this.applyChildColor) {
          const childIds = this.$store.getters['categories/getChildCategoriesIds'](id)
          const categories = this.$store.state.categories.items
          for (const childId of childIds) {
            const category = categories[childId]
            db.ref(`users/${uid}/categories/${childId}`).set({
              ...category,
              color: categoriesValues.color
            })
          }
        }

        this.$store.commit('categories/setCategoryEditId', null)
        this.$store.dispatch('ui/setActiveTab', 'categories')

        if (this.$listeners.callback) { this.$listeners.callback() }
      }
    },

    validateForm () {
      const categories = this.$store.state.categories.items
      if (!this.category.name) {
        this.$notify({
          title: '😮',
          text: this.$t('categories.form.name.error')
        })
        return false
      }

      for (const categoryId in categories) {
        if (categories[categoryId].name === this.category.name && categories[categoryId].parentId === this.category.parentId) {
          if (this.categoryId) {
            if (this.categoryId !== categoryId) {
              this.$notify({
                title: '😮',
                text: this.$t('categories.form.name.exist')
              })
              return false
            }
          }
          else {
            this.$notify({
              title: '😮',
              text: this.$t('categories.form.name.exist')
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
LayoutComponentWrap
  template(slot="headerLeft")
    template(v-if="!categoryId")
      div {{ $t('categories.createNewTitle') }}
    template(v-else) {{ $t('categories.editTitle') }}

  template(slot="content")
    .form
      .form-line._text
        .inputText
          input(
            type="text"
            :placeholder="$t('categories.form.name.placeholder')"
            v-model="category.name"
          ).inputText__value
          .inputText__label {{ $t('categories.form.name.label') }}

      //- can not change root category if inside this category already has some categories
      template(v-if="this.$store.getters['categories/getChildCategoriesIds'](categoryId).length === 0 && $store.getters['categories/hasCategories']")
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
                  .inputModal__icon: .mdi.mdi-folder-star
                  .inputModal__name {{ $t('categories.form.parent.no') }}
              .inputModal__label {{ $t('categories.form.parent.label') }}

      .form__btns
        .form__btns__i
          .form-line(@click="showColors = true")
            .inputModal._flex
              .inputModal__value: .inputModal__color(:style="{ background: category.color }")
              .inputModal__label {{ $t('categories.form.color.label') }}

        .form__btns__i
          .form-line(@click="showIcons = true")
            .inputModal._flex
              .inputModal__icon: div(:class="category.icon", :style="{ color: category.color }")
              .inputModal__label {{ $t('categories.form.icon.label') }}

      template(v-if="$store.getters['categories/getChildCategoriesIds'](categoryId).length")
        .form-line._p0._clean
          SharedInputsCheckbox(
            v-model="applyChildColor"
            :title="$t('categories.form.childColor')"
            :alt="true"
          )

      template(v-if="$store.getters['categories/getChildCategoriesIds'](categoryId).length === 0")
        .form-line._p0._clean
          SharedInputsCheckbox(
            v-model="category.showInLastUsed"
            :title="$t('categories.form.lastUsed')"
            :alt="true")
        .form-line._p0._clean
          SharedInputsCheckbox(
            v-model="category.showInQuickSelector"
            :title="$t('categories.form.quickSelector')"
            :alt="true")

    //- colors
    Portal(
      v-if="showColors"
      to="modal"
    )
      ModalBottom(
        :center="true"
        :title="$t('categories.form.color.placeholder')"
        @onClose="showColors = false"
      )
        .inputText
          .inputText__colors
            .colors
              .colorItem(
                :class="{ _active: category.color === color }"
                :style="{ background: color }"
                v-for="color in colors"
                @click="handleColorSelect(color)"
              )
        .customColor
          .customColor__title {{ $t('categories.form.color.custom') }}
          input.customColor__value(v-model="category.color" type="color")

    //- parent
    Portal(
      v-if="showParents"
      to="modal"
    )
      ModalBottom(
        key="parent"
        :center="true"
        :title="$t('categories.form.parent.label')"
        @onClose="showParents = false"
      )
        .padding-bottom
          ModalButton(
            :name="$t('categories.form.parent.no')"
            icon="mdi mdi-folder-star"
            @onClick="() => handleParenCategorySelect(0)")
        CategoriesView(
          :noPadding="true"
          :ids="$store.getters['categories/categoriesForBeParent'].filter(cId => cId !== categoryId)"
          @onClick="handleParenCategorySelect")

    //- icons
    Portal(
      v-if="showIcons"
      to="modal"
    )
      ModalBottom(
        :center="true"
        :title="$t('categories.form.icon.placeholder')"
        @onClose="showIcons = false"
      )
        .icons
          .icons__group(
            v-for="iconGroup in icons"
          )
            .iconItem(
              v-for="icon in iconGroup"
              :class="{ _active: category.icon === icon }"
              :style="{ color: category.color }"
              @click="handleIconSelect(icon)"
            )
              div(:class="icon")

  template(slot="bottom")
    .col
      SharedButton(
        :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
        :title="$t('categories.form.save')"
        @onClick="handleSubmit"
      )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.icons
  &__group
    display grid
    grid-template-columns repeat(auto-fill, minmax(50px, 1fr))
    padding-bottom 20px

.iconItem
  display flex
  align-items center
  justify-content center
  min-height 50px
  padding 8px
  font-size 30px

  &._active
    background var(--c-bg-2)
    border-radius 4px
    box-shadow 0 2px 10px 0 var(--shaddow)

.customColor
  margin (- $m7)
  margin-top 0
  padding $m7
  background var(--c-bg-3)

  @media $media-laptop
    margin (- $m9)
    margin-top 0
    padding $m9

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
@import '~assets/stylus/variables/media'

.dashboard .component
  .categories__list
    @media $media-laptop
      grid-template-columns repeat(3,  1fr)
</style>
