import { createApp } from 'vue'
import { datadogRum } from '@datadog/browser-rum'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'

const { VITE_GLOB_APP_NAME, VITE_GLOB_APP_ENVIRONMENT, VITE_GLOB_APP_VERSION } = import.meta.env

async function bootstrap() {
  const app = createApp(App)
  setupAssets()
  setupScrollbarStyle()
  setupStore(app)
  setupI18n(app)
  await setupRouter(app)

  if (VITE_GLOB_APP_ENVIRONMENT === 'production') {
  // Initialize Datadog RUM
    datadogRum.init({
      applicationId: 'a294f5a8-b059-4711-aadc-1c8e8a2c327d',
      clientToken: 'pub978e5db4d73c2036c561d2dd9d8bca71',
      site: 'datadoghq.com',
      service: VITE_GLOB_APP_NAME,
      env: VITE_GLOB_APP_ENVIRONMENT,
      version: VITE_GLOB_APP_VERSION,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 100,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'allow',
    })
    datadogRum.startSessionReplayRecording()
  }

  app.mount('#app')
}

bootstrap()
