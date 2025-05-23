import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { darkTheme, lightTheme, useOsTheme } from 'naive-ui'
import { useAppStore, useUserStore } from '@/store'

export function useTheme() {
  const appStore = useAppStore()
  const userStore = useUserStore()

  const OsTheme = useOsTheme()
  const isDark = computed(() => appStore.theme === 'auto' ? OsTheme.value === 'dark' : appStore.theme === 'dark')
  const theme = computed(() => isDark.value ? darkTheme : lightTheme)

  const bodyTheme = computed(() => ({
    pbc: isDark.value ? '#0D1117' : '#FFFFFF', // primary body color for other components
    sbc: isDark.value ? '#161B22' : '#F0F4F9', // reflects on sidebar background
    rbc: isDark.value ? '#161B22' : '#F0F4F9', // reflects on chat response background
  }))

  const getCommonOverrides = () => ({
    placeholderColor: isDark.value ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)', // reflects on placeholder tip text color
    bodyColor: isDark.value ? 'rgb(13, 17, 23)' : 'rgb(255, 255, 255)', // reflects on main body
    cardColor: isDark.value ? 'rgb(13, 17, 23)' : 'rgb(255, 255, 255)', // reflects on card background
    modalColor: isDark.value ? 'rgb(24, 30, 37)' : 'rgb(255, 255, 255)', // reflects on modal background
    popoverColor: isDark.value ? 'rgb(29, 36, 45)' : 'rgb(255, 255, 255)', // reflects on popover and announcement background
    dividerColor: isDark.value ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', // reflects on divider color
  })

  const naiveTheme = ref<GlobalThemeOverrides>({ common: getCommonOverrides() })
  const naiveCustom = computed(() => ({
    Border: {
      borderRadius: '8px',
    },
    Input: {
      color: isDark.value ? 'rgb(22, 27, 34)' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
    },
    BInput: {
      borderRadius: '5px',
    },
    Button: {
      borderRadiusSmall: '8px',
      borderRadiusMedium: '20px',
    },
    Dropdown: {
      color: isDark.value ? 'rgb(29, 36, 45)' : 'rgb(255, 255, 255)',
      borderRadius: '8px',
    },
  }))

  const personaColors = {
    precise: {
      dark: { primaryColor: '#14B8A6', primaryColorHover: '#2DD4BF', primaryColorPressed: '#5EEEAD4', primaryColorSuppl: '#0D9488', chatBox: '#0F766E' },
      light: { primaryColor: '#0D9488', primaryColorHover: '#0F766E', primaryColorPressed: '#115E59', primaryColorSuppl: '#0D9488', chatBox: '#0F766E' },
    },
    balanced: {
      dark: { primaryColor: '#00B2DB', primaryColorHover: '#00C4F0', primaryColorPressed: '#06D1FF', primaryColorSuppl: '#009BBD', chatBox: '#005366' },
      light: { primaryColor: '#0083A0', primaryColorHover: '#0083A0', primaryColorPressed: '#0083A0', primaryColorSuppl: '', chatBox: '#005366' },
    },
    creative: {
      dark: { primaryColor: '#8B5CF6', primaryColorHover: '#A78BFA', primaryColorPressed: '#C4B5FD', primaryColorSuppl: '#7C3AED', chatBox: '#6D28D9' },
      light: { primaryColor: '#7C3AED', primaryColorHover: '#6D28D9', primaryColorPressed: '#5B21B6', primaryColorSuppl: '#7C3AED', chatBox: '#6D28D9' },
    },
  }

  watch(
    () => [isDark.value, userStore.userInfo.advanced.persona],
    ([dark, persona]) => {
      document.documentElement.classList.toggle('dark', Boolean(dark))

      const commonOverrides = getCommonOverrides()
      const personaColorsSelected = personaColors[persona as 'precise' | 'balanced' | 'creative'][isDark.value ? 'dark' : 'light']

      naiveTheme.value.common = {
        ...commonOverrides,
        ...personaColorsSelected,
      }

      if (personaColorsSelected) {
        document.documentElement.style.setProperty('--primary-color', personaColorsSelected.primaryColor || '#000000')
        document.documentElement.style.setProperty('--primary-color-hover', personaColorsSelected.primaryColorHover || '#000000')
        document.documentElement.style.setProperty('--chat-box', personaColorsSelected.chatBox || '#000000')
      }

      document.documentElement.style.setProperty('--pbc', bodyTheme.value.pbc)
      document.documentElement.style.setProperty('--sbc', bodyTheme.value.sbc)
      document.documentElement.style.setProperty('--rbc', bodyTheme.value.rbc)
    },
    { immediate: true },
  )

  return { theme, naiveTheme, naiveCustom }
}
