(function () {
  const frame = document.createElement('iframe')
  frame.src = 'https://v7jvlkjt9q11.statuspage.io/embed/frame'
  frame.style.position = 'fixed'
  frame.style.border = 'none'
  frame.style.boxShadow = '0 20px 32px -8px rgba(9,20,66,0.25)'
  frame.style.zIndex = '9999'
  frame.style.transition = 'left 1s ease, bottom 1s ease, right 1s ease'

  frame.title = 'AxiomAI Status'
  frame.ariaHidden = true

  let mobile
  // eslint-disable-next-line no-cond-assign
  if (mobile = screen.width < 450) {
    frame.src += '?mobile=true'
    frame.style.height = '20vh'
    frame.style.width = '100vw'
    frame.style.left = '-9999px'
    frame.style.bottom = '-9999px'
    frame.style.transition = 'bottom 1s ease'
  }
  else {
    frame.style.height = '115px'
    frame.style.width = '320px'
    frame.style.left = 'auto'
    frame.style.right = '-9999px'
    frame.style.bottom = 'calc(100% - 175px)'
  }

  frame.sandbox = 'allow-scripts allow-popups'
  frame.referrerPolicy = 'no-referrer'

  document.body.appendChild(frame)

  const actions = {
    showFrame() {
      if (mobile) {
        frame.style.left = '0'
        frame.style.bottom = '0'
      }
      else {
        frame.style.left = 'auto'
        frame.style.right = '60px'
      }
    },
    dismissFrame() {
      frame.style.left = '-9999px'
    },
  }

  window.addEventListener('message', (event) => {
    // eslint-disable-next-line no-prototype-builtins
    if (event.data.action && actions.hasOwnProperty(event.data.action))
      actions[event.data.action](event.data)
  }, false)
})()
