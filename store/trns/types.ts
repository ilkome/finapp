import type { Trns } from '~/components/trns/types'

export interface TrnsState {
  items: Trns
  edit: {
    id: null | string
  }
  modal: {
    show: boolean
    id: null | string
  }
}
