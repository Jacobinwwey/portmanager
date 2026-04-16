import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './theme.css'

import HomePage from './components/HomePage.vue'
import AudienceLanding from './components/AudienceLanding.vue'
import RoleGuide from './components/RoleGuide.vue'
import SectionLanding from './components/SectionLanding.vue'
import QuickStartCards from './components/QuickStartCards.vue'
import RoadmapPage from './components/RoadmapPage.vue'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('AudienceLanding', AudienceLanding)
    app.component('RoleGuide', RoleGuide)
    app.component('SectionLanding', SectionLanding)
    app.component('QuickStartCards', QuickStartCards)
    app.component('RoadmapPage', RoadmapPage)
  }
}

export default theme
