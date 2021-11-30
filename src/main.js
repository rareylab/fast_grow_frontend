import { createApp } from 'vue'
import App from './App.vue'
// necessary for bootstrap functions
// eslint-disable-next-line no-unused-vars
import * as boostrap from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

window.app = createApp(App).mount('#app')
