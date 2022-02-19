<script setup lang="ts">
console.log(111)
const h = ref('ref 1')

const h2 = $ref('ref 2')

console.log('h', h.value)
console.log('h2', h2)

const hey = (param: string): void => {
  console.log('sss', param)
}
</script>

<template lang="pug">
h1(@click="hey('ii')") hello {{ h }}
</template>
