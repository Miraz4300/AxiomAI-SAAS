import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, watch } from 'vue'
import { darkTheme, lightTheme, useOsTheme } from 'naive-ui'
import { useAppStore } from '@/store'

export function useTheme() {
  const appStore = useAppStore()

  const OsTheme = useOsTheme()

  const isDark = computed(() => {
    if (appStore.theme === 'auto')
      return OsTheme.value === 'dark'
    else
      return appStore.theme === 'dark'
  })

  const theme = computed(() => {
    return isDark.value ? darkTheme : lightTheme
  })

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    if (isDark.value) {
      return {
        common: {
          primaryColor: '#00B2DB',
          primaryColorHover: '#009BBD',
          primaryColorPressed: '#0083A0',
          primaryColorSuppl: '#009BBD',
          placeholderColor: 'rgba(255, 255, 255, 0.38)', // reflects on placeholder tip text color
          bodyColor: 'rgb(17, 17, 17)', // reflects on main body
          cardColor: 'rgb(25, 25, 25)', // reflects on side menu
          modalColor: 'rgb(32, 33, 35)', // reflects on all modal
          popoverColor: 'rgb(56, 56, 60)', // reflects on side menu close button
        },
      }
    }
    else {
      return {
        common: {
          primaryColor: '#0083A0',
          primaryColorHover: '#0083A0',
          primaryColorPressed: '#0083A0',
          placeholderColor: 'rgba(0, 0, 0, 0.38)', // reflects on placeholder tip text color
          bodyColor: 'rgb(255, 255, 255)', // reflects on main body
          cardColor: 'rgb(255, 255, 255)', // reflects on side menu
          modalColor: 'rgb(255, 255, 255)', // reflects on all modal
          popoverColor: 'rgb(255, 255, 255)', // reflects on side menu close button
        },
      }
    }
  })

  watch(
    () => isDark.value,
    (dark) => {
      if (dark)
        document.documentElement.classList.add('dark')
      else
        document.documentElement.classList.remove('dark')
    },
    { immediate: true },
  )

  return { theme, themeOverrides }
}
