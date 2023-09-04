import { createApp } from 'vue'
import { datadogRum } from '@datadog/browser-rum'
import * as Sentry from '@sentry/vue'
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
  const router = await setupRouter(app)

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

    // Initialize Sentry Issue Tracking
    Sentry.init({
      app,
      dsn: 'https://20e13cb921da2d5b62e9d6da7701efa6@o4505499531673600.ingest.sentry.io/4505759136088064',
      environment: VITE_GLOB_APP_ENVIRONMENT,
      release: VITE_GLOB_APP_VERSION,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['https://chat.axiomaibd.com'],
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        }),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 0.5,
    })
  }

  app.mount('#app')
}

bootstrap()
