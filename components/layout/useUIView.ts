import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'

const ui = ref({
  showCatsHorizontalList: true,
  showCatsVerticalChart: true,
  showMainChart: true,
  showRoundCats: true,
})

export default function useUIView() {
  async function setUI({ name, value }) {
    ui.value[name] = value
    await localforage.setItem('finapp.ui', deepUnref(ui.value))
  }

  return {
    ui,
    setUI,
  }
}
