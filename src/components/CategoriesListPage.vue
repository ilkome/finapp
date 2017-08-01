<template lang="pug">
.content
  .module
    .module-in
      h1.title Categories

      .gridTable
        .gridTable__item
          .trnForm__filter
            input(type="text", v-model.trim="filter", placeholder="Filter" v-focus.lazy="focus").filterBtn._mbn
            template(v-if="filter")
              .trnForm__filter__toogle.btn._transFix(@click.prevent="filter = ''") Clear

          template(v-if="filter.length > 0 && filter.length < 2")
            div Continue typing...

          template(v-if="filter.length >= 2 && searchedCategoriesList.length === 0")
            div Nothing found

          .categoriesList
            //- Category
            //------------------------------------------------
            .categoryItem._link(
              v-for="category in cats",
              :key="category.id",
              :class="{_editable: editedCategory === category.id, _link: category.children.length}"
            )
              .categoryItem__content
                router-link(
                  :to="`/categories/${category.id}`",
                  title="Go to category"
                ).categoryItem__icon
                  .icon._link(:style="`background: ${category.color}`")
                    .icon__pic: div(:class="category.icon")

                template(v-if="category.children.length && editedCategory !== category.id")
                  .categoryItem__name(@click="toogleShowChildrenCategoriess(category.id)") {{ category.name }}
                  .categoryItem__action(@click="toogleShowChildrenCategoriess(category.id)"): .fa.fa-list
                template(v-else)
                  .categoryItem__name {{ category.name }}

                template(v-if="editedCategory === category.id")
                  .categoryItem__action(@click.prevent="setEditedCategory(category.id)")
                    .fa.fa-times-circle
                template(v-else)
                  .categoryItem__action(@click.prevent="setEditedCategory(category.id)")
                    .fa.fa-pencil-square-o

                .categoryItem__action(@click.prevent="askQuestion(category.id)")
                  .fa.fa-trash-o

              .item__question(:class="{_visible: questionId === category.id}")
                .item__el._question
                  div Delete category?
                .item__el._action(@click.prevent.stop="close()"): .fa.fa-ban
                .item__el._action(@click.prevent.stop="deleteCategory(category.id)"): .fa.fa-check

              //- Category edit
              //------------------------------------------------
              template(v-if="editedCategory === category.id")
                .categoryItem__edit
                  .form
                    .input
                      input.input__field(
                        v-model.lazy="values.name = category.name", type="text" name="name")
                      .input__label Name
                    .input
                      input.input__field._color(
                        v-model.lazy="values.color = category.color", type="color" name="color")
                      .input__label Color
                    .input
                      input.input__field(
                        v-model.lazy="values.icon = category.iconValue", type="text" name="icon")
                      .input__label Icon
                    .input
                      input.input__field(
                        v-model.lazy="values.parentId = category.parentId", type="text" name="parentId")
                      .input__label Parent id
                    .btn(@click="updateCategory(category, values)") Update

              //- Children
              //------------------------------------------------
              template(v-if="category.children")
                template(v-if="showedChildrenCategories.indexOf(category.id) !== -1")
                  .categoryItem__children._link
                    .categoryItemChild(
                      v-for="childrenCategory in category.children",
                      :key="childrenCategory.id",
                      :class="{_editable: editedCategory === childrenCategory.id}")

                      .categoryItemChild__content
                        router-link(:to="`/categories/${childrenCategory.id}`").categoryItemChild__icon
                          .icon(:style="`background: ${childrenCategory.color}`")
                            .icon__pic
                              div(:class="childrenCategory.icon")

                        router-link(:to="`/categories/${childrenCategory.id}`").categoryItemChild__name {{ childrenCategory.name }}
                        template(v-if="editedCategory === childrenCategory.id")
                          .categoryItemChild__action(@click.prevent="setEditedCategory(childrenCategory.id)"): .fa.fa-times-circle
                        template(v-else)
                          .categoryItemChild__action(@click.prevent="setEditedCategory(childrenCategory.id)"): .fa.fa-pencil-square-o
                        .categoryItemChild__action(@click.prevent="askQuestion(childrenCategory.id)")
                          .fa.fa-trash-o

                      .item__question(:class="{_visible: questionId === childrenCategory.id}")
                        .item__el._question
                          div Удалить транзакцию?
                        .item__el._action(@click.prevent.stop="close()"): .fa.fa-ban
                        .item__el._action(@click.prevent.stop="deleteCategory(childrenCategory.id)"): .fa.fa-check

                      //- Children edit
                      //------------------------------------------------
                      template(v-if="editedCategory === childrenCategory.id")
                        .categoryItem__edit
                          .form
                            .input
                              input.input__field(
                                v-model.lazy="values.name = childrenCategory.name", type="text" name="name")
                              .input__label Name
                            .input
                              input.input__field(
                                v-model.lazy="values.color = childrenCategory.color", type="text" name="color")
                              .input__label Color
                            .input
                              input.input__field(
                                v-model.lazy="values.icon = childrenCategory.iconValue", type="text" name="icon")
                              .input__label Icon
                            .input
                              input.input__field(
                                v-model.lazy="values.parentId = childrenCategory.parentId", type="text" name="parentId")
                              .input__label Parent id
                            .btn(@click="updateCategory(childrenCategory, values)") Update

        .gridTable__item
          .panel._mb
            h4.title._mbs Create category
            .panel__content
              .input
                input(v-model.trim="newCategory.name", placeholder="Write category name" type="text").input__field
                .input__label Name
              .input
                input.input__field(
                  v-model.lazy="newCategory.color", type="text" name="color")
                .input__label Color
              .input
                input.input__field(
                  v-model.lazy="newCategory.icon", type="text" name="icon")
                .input__label Icon
              .input
                input(v-model.trim="newCategory.parentId", placeholder="Write parent id" type="text").input__field
                .input__label Parent id
              .submit
                .submit__btn(@click.prevent="addCategory(newCategory)") Create category

          .panel._mb
            ul
              li: a.link(href="http://fontawesome.io/icons/", target="_blank") Fontawesome icons
              li: a.link(href="https://materialdesignicons.com/", target="_blank") Material Design Icons

          .panel._mb
            .categoriesIcons
              .categoriesIcons__el(v-for="category in sortedCategories", :key="category.id")
                router-link(:to="`/categories/${category.id}`").categoryItem__icon
                  .icon(:style="`background: ${category.color}`")
                    .icon__pic
                      template(v-if="category.icon")
                        .fa(:class="category.icon")
                      template(v-else)
                        .fa.fa-industry
                    .icon__label {{ category.name }}
</template>
<script src="./categoriesListPage.js"></script>
