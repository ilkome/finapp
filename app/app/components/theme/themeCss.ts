export const RADIUSES = [0, 0.5]

/** A stored radius from an older, longer option list: any rounding becomes the rounded option. */
export function snapRadius(value: number) {
  return RADIUSES.includes(value) ? value : value > 0 ? 0.5 : 0
}

export const radiusCss = (radius: number) => `:root { --ui-radius: ${radius}rem; }`

export function blackAsPrimaryCss(isBlack: boolean) {
  return isBlack ? `:root { --ui-primary: black; } .dark { --ui-primary: #ededed; }` : ':root {}'
}
