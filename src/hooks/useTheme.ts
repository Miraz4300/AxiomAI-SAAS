import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { darkTheme, lightTheme, useOsTheme } from 'naive-ui'
import { useAppStore, useSettingStore } from '@/store'

export function useTheme() {
  const appStore = useAppStore()
  const settingStore = useSettingStore()

  const OsTheme = useOsTheme()
  const isDark = computed(() => appStore.theme === 'auto' ? OsTheme.value === 'dark' : appStore.theme === 'dark')
  const theme = computed(() => isDark.value ? darkTheme : lightTheme)

  const bodyTheme = computed(() => ({
    cbc: isDark.value ? '#0D1117' : '#FFFFFF', // reflects on chat body
    sbc: isDark.value ? '#161B22' : '#E8EAF1', // reflects on sidebar background
    rbc: isDark.value ? '#161B22' : '#ECEEF1', // reflects on chat response background
    hc: isDark.value ? '#0D1117' : '#FFFFFF', // reflects on header background
  }))

  const getCommonOverrides = () => ({
    placeholderColor: isDark.value ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)', // reflects on placeholder tip text color
    bodyColor: isDark.value ? 'rgb(13, 17, 23)' : 'rgb(255, 255, 255)', // reflects on main body
    cardColor: isDark.value ? 'rgb(13, 17, 23)' : 'rgb(255, 255, 255)', // reflects on card background
    modalColor: isDark.value ? 'rgb(22, 27, 34)' : 'rgb(255, 255, 255)', // reflects on modal background
    popoverColor: isDark.value ? 'rgb(22, 27, 34)' : 'rgb(255, 255, 255)', // reflects on popover background
    dividerColor: isDark.value ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', // reflects on divider color
  })

  const themeOverrides = ref<GlobalThemeOverrides>({ common: getCommonOverrides() })
  const inputThemeOverrides = computed(() => ({
    Input: {
      color: isDark.value ? 'rgb(22, 27, 34)' : 'rgba(255, 255, 255, 0.1)',
    },
  }))
  const dropdownThemeOverrides = computed(() => ({
    Dropdown: {
      color: isDark.value ? 'rgb(22, 27, 34)' : 'rgb(255, 255, 255)',
    },
  }))

  const personaColors = {
    precise: {
      dark: { primaryColor: '#14b8a6', primaryColorHover: '#2dd4bf', primaryColorPressed: '#5eead4', primaryColorSuppl: '#0d9488', chatBox: '#0f766e' },
      light: { primaryColor: '#0d9488', primaryColorHover: '#0f766e', primaryColorPressed: '#115e59', primaryColorSuppl: '#0d9488', chatBox: '#0f766e' },
    },
    balanced: {
      dark: { primaryColor: '#00B2DB', primaryColorHover: '#00C4F0', primaryColorPressed: '#06D1FF', primaryColorSuppl: '#009BBD', chatBox: '#005366' },
      light: { primaryColor: '#0083A0', primaryColorHover: '#0083A0', primaryColorPressed: '#0083A0', primaryColorSuppl: '', chatBox: '#005366' },
    },
    creative: {
      dark: { primaryColor: '#8b5cf6', primaryColorHover: '#a78bfa', primaryColorPressed: '#c4b5fd', primaryColorSuppl: '#7c3aed', chatBox: '#6d28d9' },
      light: { primaryColor: '#7c3aed', primaryColorHover: '#6d28d9', primaryColorPressed: '#5b21b6', primaryColorSuppl: '#7c3aed', chatBox: '#6d28d9' },
    },
  }

  watch(
    () => [isDark.value, settingStore.persona],
    ([dark, persona]) => {
      document.documentElement.classList.toggle('dark', Boolean(dark))

      const commonOverrides = getCommonOverrides()
      const personaColorsSelected = personaColors[persona as 'precise' | 'balanced' | 'creative'][isDark.value ? 'dark' : 'light']

      themeOverrides.value.common = {
        ...commonOverrides,
        ...personaColorsSelected,
      }

      if (personaColorsSelected) {
        document.documentElement.style.setProperty('--primary-color', personaColorsSelected.primaryColor || '#000000')
        document.documentElement.style.setProperty('--primary-color-hover', personaColorsSelected.primaryColorHover || '#000000')
        document.documentElement.style.setProperty('--chat-box', personaColorsSelected.chatBox || '#000000')
      }

      document.documentElement.style.setProperty('--cbc', bodyTheme.value.cbc)
      document.documentElement.style.setProperty('--sbc', bodyTheme.value.sbc)
      document.documentElement.style.setProperty('--rbc', bodyTheme.value.rbc)
      document.documentElement.style.setProperty('--hc', bodyTheme.value.hc)
    },
    { immediate: true },
  )

  return { theme, themeOverrides, inputThemeOverrides, dropdownThemeOverrides }
}
