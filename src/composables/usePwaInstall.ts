import { computed, ref, shallowRef } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const deferredPrompt = shallowRef<BeforeInstallPromptEvent | null>(null)
const iosHelpOpen = ref(false)
const installed = ref(false)
let initialized = false

function initialize() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  installed.value = window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    installed.value = true
    deferredPrompt.value = null
    iosHelpOpen.value = false
  })
}

export function usePwaInstall() {
  initialize()
  const isIos = computed(() => /iphone|ipad|ipod/i.test(navigator.userAgent) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1))
  const canInstall = computed(() => !installed.value && (!!deferredPrompt.value || isIos.value))

  async function install() {
    if (deferredPrompt.value) {
      const prompt = deferredPrompt.value
      await prompt.prompt()
      const choice = await prompt.userChoice
      if (choice.outcome === 'accepted') deferredPrompt.value = null
      return
    }
    if (isIos.value) iosHelpOpen.value = true
  }

  return {
    canInstall,
    installed,
    iosHelpOpen,
    install,
    closeIosHelp: () => { iosHelpOpen.value = false },
  }
}
