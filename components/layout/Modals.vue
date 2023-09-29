<template lang="pug">
.h-0
  TrnFormWrap

  //- Trn Item
  TrnsItemModal

  //- Currencies
  CurrenciesModal

  //- Notifications
  Notifications(
    :max="2"
    :position="$store.state.ui.width < 600 ? 'top center' : 'top center'"
    :width="$store.state.ui.width < 600 ? '94%' : '380px'"
    classes="notifications"
  )
</template>
