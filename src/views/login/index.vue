<script setup lang="ts">
import { NButton } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import EmailSignup from './components/EmailSignup.vue'
import EmailLogin from './components/EmailLogin.vue'
import ResetPassword from './components/ResetPassword.vue'
import AuthLayout from './components/AuthLayout.vue'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const show = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const route = useRoute()
const sign = ref('')

const currentTab = ref('emailLogin')

onMounted(async () => {
  sign.value = route.query.verifyresetpassword as string
  if (sign.value) {
    currentTab.value = 'resetPassword'
    show.value = true
  }
})
</script>

<template>
  <AuthLayout>
    <div class="px-4 rounded w-full max-w-lg">
      <header class="mb-8 text-center">
        <h1 class="text-3xl md:text-3xl font-medium text-slate-700 dark:text-slate-200">
          Welcome back
        </h1>
      </header>
      <div class="flex flex-col gap-4">
        <p class="text-slate-500 dark:text-slate-200 text-base text-center">
          Discover AxiomAI: Log in for endless possibilities or create an account to unleash GPT's potential.
        </p>
        <EmailLogin v-if="currentTab === 'emailLogin'" />
        <EmailSignup v-else-if="currentTab === 'emailSignup'" />
        <ResetPassword v-else />
        <div class="w-full flex justify-between">
          <NButton v-show="currentTab !== 'emailLogin' && currentTab !== 'resetPassword'" text type="primary" @click="currentTab = 'emailLogin'">
            ← Go back to login
          </NButton>
          <NButton v-show="currentTab !== 'emailSignup' && currentTab !== 'resetPassword'" text type="primary" @click="currentTab = 'emailSignup'">
            Create account
          </NButton>
          <NButton v-show="currentTab !== 'resetPassword' && currentTab !== 'emailSignup'" text type="primary" @click="currentTab = 'resetPassword'">
            Forgot password?
          </NButton>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
