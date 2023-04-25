import { darkTheme, lightTheme } from 'naive-ui'

function setupScrollbarStyle() {
  const style = document.createElement('style')
  const styleContent = `
    ::-webkit-scrollbar {
      background-color: transparent;
      width: ${lightTheme.Scrollbar.common?.scrollbarWidth};
    }
    ::-webkit-scrollbar-thumb {
      background-color: #525252;
      border-radius: ${lightTheme.Scrollbar.common?.scrollbarBorderRadius};
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: #737373;
    }

    html.dark ::-webkit-scrollbar {
      background-color: transparent;
      width: ${darkTheme.Scrollbar.common?.scrollbarWidth};
    }
    html.dark ::-webkit-scrollbar-thumb {
      background-color: ${darkTheme.Scrollbar.common?.scrollbarColor};
      border-radius: ${darkTheme.Scrollbar.common?.scrollbarBorderRadius};
    }

    html.dark ::-webkit-scrollbar-thumb:hover {
      background-color: ${darkTheme.Scrollbar.common?.scrollbarColorHover};
    }
  `

  style.innerHTML = styleContent
  document.head.appendChild(style)
}

export default setupScrollbarStyle
