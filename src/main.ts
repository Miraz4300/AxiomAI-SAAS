import { createApp } from 'vue'
import { datadogRum } from '@datadog/browser-rum'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'

async function bootstrap() {
  const app = createApp(App)
  setupAssets()
  setupScrollbarStyle()
  setupStore(app)
  setupI18n(app)
  await setupRouter(app)

  // Initialize Datadog RUM
  datadogRum.init({
    applicationId: 'a294f5a8-b059-4711-aadc-1c8e8a2c327d',
    clientToken: 'pub978e5db4d73c2036c561d2dd9d8bca71',
    site: 'datadoghq.com',
    service: 'axiomai',
    env: 'prod',
    version: '3.0.0-preview1',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'allow',
  })

  datadogRum.startSessionReplayRecording()

  app.mount('#app')
}

bootstrap()
