<script setup lang="ts">
const includeArchivedInStats = defineModel<boolean>('includeArchivedInStats', { required: true })
const includeExcludedInStats = defineModel<boolean>('includeExcludedInStats', { required: true })
const isShowGroupCount = defineModel<boolean>('isShowGroupCount', { required: true })
const showArchived = defineModel<boolean>('showArchived', { required: true })

const { t } = useI18n()
</script>

<template>
  <div>
    <UiSwitchItem
      :checkboxValue="showArchived"
      :title="t('wallets.options.showArchived')"
      trailing
      @toggle="showArchived = !showArchived"
    />
    <UiSwitchItem
      :checkboxValue="includeArchivedInStats"
      :title="t('wallets.options.includeArchivedInStats')"
      trailing
      @toggle="includeArchivedInStats = !includeArchivedInStats"
    />
    <UiSwitchItem
      :checkboxValue="includeExcludedInStats"
      :title="t('wallets.options.includeExcludedInStats')"
      trailing
      @toggle="includeExcludedInStats = !includeExcludedInStats"
    />
    <UiSwitchItem
      :checkboxValue="isShowGroupCount"
      :title="t('wallets.options.showGroupCount')"
      trailing
      @toggle="isShowGroupCount = !isShowGroupCount"
    />
  </div>
</template>
