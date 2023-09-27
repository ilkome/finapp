import type { TrnsState } from '~/store/trns/types'

export function state(): TrnsState {
  return {
    items: {},
    edit: {
      id: null,
    },
    modal: {
      show: false,
      id: null,
    },
  }
}
