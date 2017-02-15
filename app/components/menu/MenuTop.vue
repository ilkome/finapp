<template lang="pug">
  ul.menutop
    li.menutop__el: router-link(to="/create").menutop__link Создать
    li.menutop__el: router-link(to="/accounts").menutop__link Кошельки
    li.menutop__el: router-link(to="/trns").menutop__link Операции
</template>

<script>
export default {
}
</script>
