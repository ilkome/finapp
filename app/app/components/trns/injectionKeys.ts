import type { InjectionKey } from 'vue'

import type { TrnsSelection } from '~/components/trns/useTrnsSelection'

export const trnsSelectionKey: InjectionKey<TrnsSelection> = Symbol('trnsSelection')
