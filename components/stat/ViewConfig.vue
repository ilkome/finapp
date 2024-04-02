<script setup lang="ts">
import useUIView from '~/components/layout/useUIView'

const { ui, setUI } = useUIView()

function toggleView(name) {
  setUI({ name, value: !ui.value[name] })
}
</script>

<template>
  <div class="flex">
    <StatChartOptionsItem
      :isActive="ui.showCatsVerticalChart"
      icon="mdi mdi-poll"
      @click="toggleView('showCatsVerticalChart')"
    />

    <StatChartOptionsItem
      :isActive="ui.showRoundCats"
      icon="mdi mdi-chart-bubble"
      @click="toggleView('showRoundCats')"
    />

    <StatChartOptionsItem
      :isActive="ui.showCatsHorizontalList"
      icon="mdi mdi-chart-timeline"
      @click="toggleView('showCatsHorizontalList')"
    />
  </div>
</template>
