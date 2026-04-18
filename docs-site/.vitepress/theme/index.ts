import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './theme.css'

import QuickStartCards from './components/QuickStartCards.vue'
import MilestoneConfidencePage from './components/MilestoneConfidencePage.vue'
import RoadmapPage from './components/RoadmapPage.vue'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuickStartCards', QuickStartCards)
    app.component('MilestoneConfidencePage', MilestoneConfidencePage)
    app.component('RoadmapPage', RoadmapPage)
  }
}

export default theme
