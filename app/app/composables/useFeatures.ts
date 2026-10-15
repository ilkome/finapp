import { useStorage } from '@vueuse/core'

// Features still in development stay hidden until the user turns them on in Settings on this
// device. A flag hides UI entry points only, never data, sync or calculations, so turning it
// off cannot lose or change anything. Drop the flag and its checks once the feature ships.
export const featureIds = ['loans', 'emailSignIn', 'trnPreview'] as const
type FeatureId = typeof featureIds[number]

const FEATURES_KEY = 'finapp.features'
const featureDefaults: Record<FeatureId, boolean> = {
  emailSignIn: false,
  loans: false,
  trnPreview: false,
}

// One ref and one storage listener per tab, created on first use, not one per call site.
let features: ReturnType<typeof createFeatures> | undefined

function createFeatures() {
  // mergeDefaults backfills a flag added after the value was first stored.
  return useStorage(FEATURES_KEY, { ...featureDefaults }, undefined, { mergeDefaults: true })
}

export function useFeatures() {
  features ??= createFeatures()
  return features
}

export function useFeature(id: FeatureId) {
  const store = useFeatures()
  return computed(() => store.value[id])
}
