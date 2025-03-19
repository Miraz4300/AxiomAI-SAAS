import type { VNode } from 'vue'

declare module 'naive-ui' {
  export interface NTabPaneProps {
    name?: string | number
  }

  export interface NTabPaneSlots {
    default: () => VNode[]
    tab: () => VNode[]
  }

  export const NTabPane: new () => {
    $props: NTabPaneProps
    $slots: NTabPaneSlots
  }
}
