import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import AntraegeView from '../views/AntraegeView.vue'
import KontaktView from '../views/KontaktView.vue'
import AnweisungenView from '../views/AnweisungenView.vue'
import ProfileView from '../views/ProfileView.vue'
import GehaltsAbrechnungView from "../views/GehaltsAbrechnungView.vue";
import AdminView from '../views/AdminView.vue'

const routes = [
    { path: '/', redirect: '/login' }, // Leitet die Standard-URL direkt zum Login weiter
    { path: '/login', name: 'login', component: LoginView },
    { path: '/home', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/antraege', name: 'antraege', component: AntraegeView, meta: { requiresAuth: true } },
    { path: '/kontakt', name: 'kontakt', component: KontaktView },
    { path: '/anweisungen', name: 'anweisungen', component: AnweisungenView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/gehalt', name: 'Gehalt', component: GehaltsAbrechnungView, meta: { requiresAuth: true } },
    { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// Globaler Sicherheits-Guard
router.beforeEach((to, from, next) => {
    const userJson = localStorage.getItem('currentUser')
    const user = userJson ? JSON.parse(userJson) : null

    // Wenn die Seite einen Login erfordert und niemand eingeloggt ist -> ab zum Login
    if (to.meta.requiresAuth && !user) {
        next({ name: 'login' })
    }
    // Wenn die Seite Admin-Rechte verlangt, der User aber kein Admin ist -> ab zur Home-Seite
    else if (to.meta.requiresAdmin && (!user || user.role !== 'admin')) {
        next({ name: 'home' })
    }
    // Wenn ein bereits eingeloggter User auf die Login-Seite will, direkt weiterleiten
    else if (to.name === 'login' && user) {
        if (user.role === 'admin') {
            next({ name: 'admin' })
        } else {
            next({ name: 'home' })
        }
    }
    else {
        next()
    }
})

export default router