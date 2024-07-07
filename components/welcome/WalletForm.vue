<script setup lang="ts">
import { getPreparedFormData } from '~/components/wallets/getForm'

const emit = defineEmits(['afterSave'])
const { t } = useI18n()

const walletForm = ref(getPreparedFormData())

function updateValue(id, value) {
  walletForm.value[id] = value
}

function afterSave() {
  emit('afterSave')
}

useHead({
  title: () => `${t('base.add')}:
    ${
      walletForm.value?.name
        ? walletForm.value?.name
        : t('categories.form.name.label')
    }`,
})
</script>

<template>
  <div class="mb-3 px-2 py-5 font-primary">
    <div class="pb-1 text-xs font-medium text-item-2">
      {{ $t("wallets.createNewTitle") }}
    </div>

    <div class="flex items-center gap-3">
      <div class="text-2xl font-semibold text-item-1">
        {{ walletForm.name ? walletForm.name : $t("wallets.form.name.label") }}
      </div>
      <div
        class="flex-center rounded p-1 text-2xs text-icon-primary"
        :style="{ background: walletForm.color }"
      >
        {{ walletForm.currency }}
      </div>
    </div>

    <WalletsForm
      :walletForm="walletForm"
      @afterSave="afterSave"
      @updateValue="updateValue"
    />
  </div>
</template>
