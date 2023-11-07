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

  const getCommonOverrides = () => ({
    placeholderColor: isDark.value ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)', // reflects on placeholder tip text color
    bodyColor: isDark.value ? 'rgb(17, 17, 20)' : 'rgb(255, 255, 255)', // reflects on main body
    cardColor: isDark.value ? 'rgb(24, 24, 28)' : 'rgb(255, 255, 255)', // reflects on card background
    modalColor: isDark.value ? 'rgb(32, 33, 35)' : 'rgb(255, 255, 255)', // reflects on modal background
    popoverColor: isDark.value ? 'rgb(56, 56, 60)' : 'rgb(255, 255, 255)', // reflects on side menu close button
  })

  const themeOverrides = ref<GlobalThemeOverrides>({ common: getCommonOverrides() })

  const personaColors = {
    precise: {
      dark: { primaryColor: '#14b8a6', primaryColorHover: '#2dd4bf', primaryColorPressed: '#5eead4', primaryColorSuppl: '#14b8a6' },
      light: { primaryColor: '#0d9488', primaryColorHover: '#0f766e', primaryColorPressed: '#115e59', primaryColorSuppl: '#0d9488' },
    },
    balanced: {
      dark: { primaryColor: '#00B2DB', primaryColorHover: '#009BBD', primaryColorPressed: '#0083A0', primaryColorSuppl: '#009BBD' },
      light: { primaryColor: '#0083A0', primaryColorHover: '#0083A0', primaryColorPressed: '#0083A0', primaryColorSuppl: '' },
    },
    creative: {
      dark: { primaryColor: '#8b5cf6', primaryColorHover: '#a78bfa', primaryColorPressed: '#c4b5fd', primaryColorSuppl: '#8b5cf6' },
      light: { primaryColor: '#7c3aed', primaryColorHover: '#6d28d9', primaryColorPressed: '#5b21b6', primaryColorSuppl: '#7c3aed' },
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
      }
    },
    { immediate: true },
  )

  return { theme, themeOverrides }
}
