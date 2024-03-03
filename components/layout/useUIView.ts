
import localforage from 'localforage'

const localName = 'finapp.ui'

const ui = reactive({
  showCatsHorizontalList: true,
  showCatsVerticalChart: true,
  showMainChart: true,
  showRoundCats: true,
})

export default function useUIView() {
  async function getLocalUI(): Promise<{}> {
    return await localforage.getItem(localName) || {}
  }

  async function setUI({ name, value }) {
    const localUI = await getLocalUI()
    ui[name] = value

    await localforage.setItem(localName, {
      ...localUI,
      [name]: value,
    })
  }

  return {
    ui,
    setUI,
  }
}
