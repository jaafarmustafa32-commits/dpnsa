import { ref } from 'vue'

const isLightMode = ref(
    localStorage.getItem('dienstplan-theme') === 'light'
)

const applyTheme = () => {
    const root = document.documentElement

    root.classList.toggle('light-theme', isLightMode.value)

    root.style.colorScheme = isLightMode.value
        ? 'light'
        : 'dark'

    localStorage.setItem(
        'dienstplan-theme',
        isLightMode.value ? 'light' : 'dark'
    )
}

const toggleTheme = () => {
    isLightMode.value = !isLightMode.value
    applyTheme()
}

const initTheme = () => {
    applyTheme()
}

export function useAppStore() {
    return {
        isLightMode,
        toggleTheme,
        initTheme
    }
}