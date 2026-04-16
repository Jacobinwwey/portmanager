import { contentMap } from '../content-map.js'

export type LocaleCode = 'en' | 'zh'
export type AudienceCode = 'human' | 'agent' | 'shared'

export function docById(id: string) {
  const entry = contentMap.find((item) => item.id === id)
  if (!entry) {
    throw new Error(`Unknown content-map id: ${id}`)
  }
  return entry
}

export function docLink(locale: LocaleCode, id: string) {
  return `/${locale}/${docById(id).route}`
}

export function siteLink(path: string) {
  return path
}

export function githubSourceLink(sourcePath: string) {
  return `https://github.com/Jacobinwwey/portmanager/blob/main/${sourcePath}`
}

export function docMeta(locale: LocaleCode, id: string) {
  const entry = docById(id)
  return {
    ...entry,
    link: docLink(locale, id),
    title: entry.titles[locale],
    sourceLink: githubSourceLink(entry.sourcePath)
  }
}
