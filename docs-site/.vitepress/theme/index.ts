import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './theme.css'

import QuickStartCards from './components/QuickStartCards.vue'
import RoadmapPage from './components/RoadmapPage.vue'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuickStartCards', QuickStartCards)
    app.component('RoadmapPage', RoadmapPage)
  }
}

export default theme
