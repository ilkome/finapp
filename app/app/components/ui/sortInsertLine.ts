import { insert } from '@formkit/drag-and-drop'

/** Drag-and-drop plugin for every sortable list: a line marks the drop spot (the library places it, we only draw it). */
export function sortInsertLine() {
  return insert({
    insertPoint: () => {
      const line = document.createElement('div')
      line.className = 'pointer-events-none z-[100] h-0.5 rounded-full bg-primary'
      return line
    },
  })
}
