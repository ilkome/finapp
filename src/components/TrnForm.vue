<template lang="pug">
.trnForm__in
  .trnForm__form
    h2.title._border._mbs
      template(v-if="action === 'create'") Create trn
      template(v-if="action === 'update'") Update trn

    .trnForm__date
      .trnForm__date__link(
        @click="setNextPrevDate('prev')",
        @keyup.enter.prevent="setNextPrevDate('prev')",
        aria-checked="true", tabindex="0"
      ): .fa.fa-chevron-left
      .trnForm__date__value
        .fa.fa-clock-o
        .trnForm__date__value__in {{ values.date | date }}
      .trnForm__date__link(
        @click="setNextPrevDate('next')",
        @keyup.enter.prevent="setNextPrevDate('next')",
        aria-checked="true", tabindex="0"
      ): .fa.fa-chevron-right

    .amount(:class="(values.type === 1) ? '_income' : '_expense'")
      a.amountCount(
        @click="setTrnType()"
        @keyup.enter.prevent="setTrnType()",
        aria-checked="false", tabindex="0"
      )
        .amountCountText
          template(v-if="values.type === 1") +
          template(v-else) -

      .amountValue
        input.amountValueInput(
          v-model.lazy="values.amount",
          @keyup.enter="onSubmitForm",
          v-focus.lazy="$store.state.trnForm.isShow && !show.categories",
          type="text",
          name="amount",
          placeholder="0",
          aria-checked="false", tabindex="0"
        )

    .trnForm__icons
      h4._marginBottomSmall Category: {{ values.categoryName }}
      .categoriesIcons
        .categoriesIcons__el(
          v-if="lastCategories.length"
          v-for="category in lastCategories"
        )
          .icon._link(
            :class="{_active: (category.id === values.categoryId)}",
            @click.prevent="setCategory(category.id)",
            @keyup.enter.prevent="setCategory(category.id)",
            :style="`background: ${category.color}`",
            :title="category.name",
            aria-checked="false", tabindex="0"
          )
            div(:class="category.icon")
            .icon__label {{ category.name }}

        .categoriesIcons__el
          .icon._link(
            @click.prevent="toogleCategoriesPop()",
            @keyup.enter.prevent="toogleCategoriesPop()",
            v-shortkey="['alt', 'arrowup']",
            @shortkey="toogleCategoriesPop()",
            aria-checked="false", tabindex="0",
            style="background: black"
          )
            .mdi.mdi-dots-horizontal
            .icon__label Show all categories

    .trnForm__icons
      h4._marginBottomSmall Account: {{ values.accountName }}
      .categoriesIcons
        .categoriesIcons__el(v-for="account in accounts")
          a.icon._link(
            :class="[{_active: (account.id === values.accountId)}, `bg-${account.id}`]",
            :title="account.name",
            @click.prevent="setAccound(account.id)",
            @keyup.enter.prevent="setAccound(account.id)",
            aria-checked="false", tabindex="0"
          )
            .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
            .icon__label {{ account.name }}

    .trnForm__desc
      input.input-filter._nomargin(
        v-model.trim="values.description",
        @keyup.enter="onSubmitForm",
        type="text",
        name="description",
        placeholder="Description",
        aria-checked="false", tabindex="0"
      )

    .trnForm__actions
      .trnForm__errors(v-if="errors") {{ errors }}
      .trnForm__actions__btn(
        @click.prevent="onSubmitForm()",
        @keyup.enter.prevent="onSubmitForm()",
        aria-checked="false", tabindex="0"
      )
        template(v-if="action === 'create'") Create trn
        template(v-if="action === 'update'") Update trn

  //- Categories popup block
  //------------------------------------------------
  transition(name="trnFormAnimation")
    template(v-if="show.categories")
      .trnForm__categories(
        v-shortkey="['alt', 'arrowdown']",
        @shortkey="toogleShowCategories()"
      )
        .trnForm__categories__in
          .trnForm__header
            h2.title._mbn Select category
            .trnForm__header__close.btn._mini(@click.prevent="toogleCategoriesPop()") Close

          .trnForm__filter
            input(
              type="text",
              v-model.trim="filter",
              v-focus.lazy="true",
              placeholder="Search category"
            ).filterBtn._mbn

            template(v-if="!filter")
              .trnForm__filter__toogle.btn._transFix(@click.prevent="toogleShowCategories()")
                template(v-if="showedChildrenCategories.length") Collapse
                template(v-else) Show
            template(v-else)
              .trnForm__filter__toogle.btn._transFix(@click.prevent="filter = ''") Clear

          template(v-if="filter.length > 0 && filter.length < 2")
            div Continue typing...

          template(v-if="filter.length >= 2 && searchedCategoriesList.length === 0")
            div Nothing found

          .categoriesListForm
            //- Categories list
            //------------------------------------------------
            template(v-if="!filter")
              CategoryList(
                :categories="categoriesList",
                :isToogleCategories="showedChildrenCategories",
                :activeCategory="activeCategory",
                @setCategory="setCategory",
                @toogleCategory="toogleCategory")

            //- Searched categories
            //------------------------------------------------
            template(v-if="filter.length >= 2 && searchedCategoriesList.length")
              CategoryList(
                :categories="searchedCategoriesList",
                :isToogleCategories="showedChildrenCategories",
                :isSearch="true",
                :activeCategory="activeCategory",
                @setCategory="setCategory",
                @toogleCategory="toogleCategory")
</template>
<script src="./trnForm.js"></script>
