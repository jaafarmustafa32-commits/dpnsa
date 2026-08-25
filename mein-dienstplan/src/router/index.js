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
    { path: '/', name: 'login', component: LoginView },
    { path: '/home', name: 'home', component: HomeView },
    { path: '/antraege', name: 'antraege', component: AntraegeView },
    { path: '/kontakt', name: 'kontakt', component: KontaktView },
    { path: '/anweisungen', name: 'anweisungen', component: AnweisungenView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/gehalt', name: 'Gehalt', component: GehaltsAbrechnungView },
    {path: '/admin', name: 'admin', component: AdminView },]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router