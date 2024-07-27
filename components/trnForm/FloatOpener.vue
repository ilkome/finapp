<script setup lang="ts">
import { useTrnForm } from '~/components/trnForm/useTrnForm'

const { trnFormCreate } = useTrnForm()
</script>

<template>
  <div
    class="group absolute bottom-6 right-6 z-10 hidden justify-center lg:flex flex-end "
    @click="trnFormCreate"
  >
    <div
      class="
        group-hover:scale-125
        size-12
        flex items-center justify-center
        rounded-full bg-accent-2
        text-3xl text-icon-primary
        transition"
    >
      <i class="mdi mdi-plus" />
    </div>
  </div>
</template>
