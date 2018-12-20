<script>
import { db } from "@/firebase";

import ModalBottom from "@/components/modal/ModalBottom";
import ModalBottomConfirm from "@/components/modal/ModalBottomConfirm";
import ModalButton from "@/components/modal/ModalButton";
import WalletItem from "@/components/wallets/item/WalletItem";

export default {
  components: {
    ModalBottom,
    ModalBottomConfirm,
    ModalButton,
    WalletItem
  },

  data() {
    return {
      showModalConfirm: false
    };
  },

  computed: {
    deleteInfo() {
      if (this.trnsIds.length > 0) {
        return `It's also will delete ${
          this.trnsIds.length
        } trns in this wallet`;
      }
    },
    walletId() {
      return this.$store.state.wallets.modal.id;
    },
    trnsIds() {
      const trns = this.$store.state.trns.items;
      let trnsIds = [];
      for (const trnId in trns) {
        if (trns[trnId].accountId === this.walletId) trnsIds.push(trnId);
      }
      return trnsIds;
    }
  },

  methods: {
    handleSetFilterWallet(id) {
      this.$store.commit("hideWalletModal");
      this.$store.dispatch("setActiveTab", "stat");
      this.$store.commit("setFilterDateNow");
      this.$store.dispatch("setFilterWalletId", this.walletId);
    },

    handleEditClick() {
      const walletId = this.walletId;
      this.$store.commit("hideWalletModal");
      this.$store.commit("setWalletEditId", walletId);
      this.$store.dispatch("setActiveTab", "createWallet");
    },

    handleDeleteConfirm() {
      const trnsIds = this.trnsIds;
      const uid = this.$store.state.user.user.uid;
      const id = this.walletId;

      this.showModalConfirm = false;
      this.$store.commit("hideWalletModal");
      this.$store.commit("setWalletModalId", null);

      setTimeout(async () => {
        await this.$store.dispatch("deleteTrnsByIds", trnsIds);
        db.ref(`accounts/${id}`)
          .remove()
          .then(() => console.log("wallet deleted"));
      }, 200);
    }
  }
};
</script>

<template lang="pug">
ModalBottom(
  v-if="$store.state.wallets.modal.id"
  :show="$store.state.wallets.modal.show"
  v-on:onClose="$store.commit('hideWalletModal')"
  v-on:afterClose="$store.commit('setWalletModalId', null)")
  template(v-if="walletId")
    template(slot="header")
      WalletItem(:id="walletId")

    template(slot="btns")
      ModalButton(
        name="Delete"
        icon="mdi mdi-delete"
        v-on:onClick="handleDeleteClick")
      ModalButton(
        name="Edit"
        icon="mdi mdi-pencil"
        v-on:onClick="handleEditClick")
      ModalButton(
        name="Set filter"
        icon="mdi mdi-filter-outline"
        v-on:onClick="handleSetFilterWallet")

  ModalBottomConfirm(
    :show="showModalConfirm"
    :description="deleteInfo"
    v-on:onClose="showModalConfirm = false"
    v-on:onConfirm="handleDeleteConfirm")
</template>
