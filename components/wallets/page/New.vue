<script setup lang="ts">
import { getPreparedFormData } from '~/components/wallets/getForm'

const router = useRouter()
const walletForm = ref(getPreparedFormData())

const updateValue = (id, value) => walletForm.value[id] = value
const afterSave = () => router.replace('/wallets')
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: `${this.$t('base.add')}: ${this.walletForm.name ? this.walletForm.name : this.$t('wallets.form.name.label')}`,
    }
  },
})
</script>

<template>
  <UiPage>
    <div class="h-full grid grid-rows-[auto,1fr]">
      <UiHeader>
        <router-link v-slot="{ href, navigate }" to="/wallets" custom>
          <a class="grow hocus_bg-item-5" :href="href" @click="navigate">
            <UiHeaderTitle2>
              <div class="pb-1 text-xs font-medium text-item-2">
                {{ $t("wallets.createNewTitle") }}
              </div>
              <div class="flex items-center gap-3">
                <div class="text-item-1 text-2xl font-semibold">
                  {{ walletForm.name ? walletForm.name : $t("wallets.form.name.label") }}
                </div>
                <div class="p-1 flex-center rounded text-icon-primary text-2xs" :style="{ background: walletForm.color }">
                  {{ walletForm.currency }}
                </div>
              </div>
            </UiHeaderTitle2>
          </a>
        </router-link>
      </UiHeader>

      <WalletsForm
        :walletForm="walletForm"
        @afterSave="afterSave"
        @updateValue="updateValue"
      />
    </div>
  </UiPage>
</template>
