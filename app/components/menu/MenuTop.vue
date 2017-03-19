<template lang="pug">
  nav.menu
    router-link(to="/" exact).menuLink Главная
    router-link(to="/create").menuLink Создать
    router-link(to="/trns").menuLink Транзакции
    router-link(to="/categories").menuLink Категории
</template>
