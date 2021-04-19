import localforage from 'localforage'
import { reactive } from '@nuxtjs/composition-api'

const localName = 'finapp.ui'

const ui = reactive({
  showMainChart: true,
  showPieChart: false,
  showCatsVerticalChart: true,
  showRoundCats: true,
  showCatsHorizontalList: true,
  showHistory: true
})

export default function useUIView () {
  async function getLocalUI (): Promise<{}> {
    const localUI: {} = await localforage.getItem(localName) || {}
    return localUI
  }

  async function setUI ({ name, value }) {
    const localUI = await getLocalUI()
    ui[name] = value

    localforage.setItem(localName, {
      ...localUI,
      [name]: value
    })
  }

  async function initUI () {
    const localUI = await getLocalUI()
    for (const key in localUI) {
      if (ui[key]) {
        ui[key] = localUI[key]
      }
    }
  }

  return {
    ui,
    initUI,
    setUI
  }
}
