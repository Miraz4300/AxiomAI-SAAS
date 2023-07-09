import { createApp } from 'vue'
import { datadogRum } from '@datadog/browser-rum'
import * as Sentry from '@sentry/vue'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore } from './store'
import { router, setupRouter } from './router'

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
    version: '3.0.0-preview4',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'allow',
  })
  datadogRum.startSessionReplayRecording()

  // Initialize Sentry
  Sentry.init({
    app,
    dsn: 'https://aaf3ccd8fcb84cfbb189216512228687@o4505499531673600.ingest.sentry.io/4505499534557184',
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      }),
      new Sentry.Replay(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  })

  app.mount('#app')
}

bootstrap()
