import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import axios from 'axios'

// 1. Tembak ke URL Ngrok Anda
axios.defaults.baseURL = 'https://unless-civil-release.ngrok-free.dev'

// 2. TAMBAHKAN BARIS INI: Mantra penangkal blokir Ngrok
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420'

createApp(App).use(router).mount('#app')