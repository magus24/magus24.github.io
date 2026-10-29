/**
 * Trilingual message catalogue — one typed shape shared by EN / RU / UZ.
 * Everything a visitor can read on the page lives here so switching a
 * language swaps the whole system, never just a label.
 */

export interface ProjectLocalContent {
  subtitle: string
  tags: readonly string[]
  description: string
  role: string
  type: string
  case: {
    overview: string
    challenge: string
    solution: string
    result: string
    technology: readonly string[]
    stats: readonly { value: string; label: string }[]
  }
}

export interface GuideRow {
  keys: readonly string[]
  value: string
}

export interface Messages {
  meta: {
    title: string
    description: string
    ogTitle: string
    ogDescription: string
  }
  app: {
    skip: string
    keysMenu: string
    keysGuide: string
    keysTop: string
    headerCenter: string
    close: string
    index: string
    menuAria: string
    sectionsAria: string
    backToTop: string
    location: string
    statusOpen: string
  }
  nav: {
    mind: string
    idea: string
    transfer: string
    ai: string
    execution: string
    work: string
    experiments: string
    about: string
    contact: string
  }
  mind: {
    aria: string
    label: string
    headline: readonly [string, string]
    dragHint: string
    explore: string
    statProjects: string
    statExperiments: string
    statTechnologies: string
  }
  idea: {
    aria: string
    label: string
    headline: readonly [string, string]
    lead: string
    steps: readonly { name: string; note: string }[]
    footer: string
  }
  transfer: {
    aria: string
    label: string
    headline: readonly [string, string]
    sub: string
    desc: string
  }
  ai: {
    aria: string
    label: string
    headline: readonly [string, string]
    desc: string
    flow: readonly { name: string; note: string }[]
    result: string
  }
  execution: {
    aria: string
    label: string
    headline: readonly [string, string]
    desc: string
    flow: readonly { name: string; note: string }[]
    result: string
  }
  hero: {
    aria: string
    kickerPrefix: string
    headline: readonly [string, string]
    dragHint: string
    explore: string
    statProjects: string
    statExperiments: string
    statTechnologies: string
  }
  ideas: {
    aria: string
    statement: readonly [string, string, string, string]
    steps: readonly { name: string; note: string }[]
    footer: string
  }
  about: {
    aria: string
    factName: string
    factRole: string
    factFocus: string
    factLocation: string
    factTimezone: string
    factStatus: string
    manifestoPre: string
    manifestoEm1: string
    manifestoMid: string
    manifestoEm2: string
    manifestoPost: string
    disciplines: readonly string[]
    identityAria: string
    identitySystem: string
    identitySystemValue: string
    identityState: string
    identityStateValue: string
  }
  projects: {
    aria: string
    sectionTitle: string
    tagsAria: string
    openCase: string
    openCaseAria: string
    next: string
    caseLabel: string
    sourceCode: string
    liveDemo: string
    caseAria: string
    fieldOverview: string
    fieldChallenge: string
    fieldSolution: string
    fieldResult: string
    technologyAria: string
    content: Record<string, ProjectLocalContent>
  }
  experiments: {
    aria: string
    sectionTitle: string
    lede: string
    fieldPreview: string
    content: {
      vision: { title: string; description: string }
      security: { title: string; description: string }
      agents: { title: string; description: string }
      interfaces: { title: string; description: string }
      reverse: { title: string; description: string }
      hardware: { title: string; description: string }
    }
  }
  stack: {
    aria: string
    sectionTitle: string
    lede: string
    coreLabel: string
    coreSub: string
    legendRing1: string
    legendRing2: string
  }
  stackDesc: Record<string, { description: string }>
  journey: {
    aria: string
    sectionTitle: string
    lede: string
    entries: readonly {
      year: string
      title: string
      description: string
    }[]
  }
  contact: {
    aria: string
    sectionTitle: string
    titleAria: string
    lines: readonly [string, string, string, string]
    lead: string
    channels: string
  }
  finale: {
    aria: string
    title: readonly [string, string]
    sub: string
  }
  footer: {
    note: string
    top: string
  }
  command: {
    aria: string
    inputLabel: string
    placeholder: string
    commandsAria: string
    groupNav: string
    groupSections: string
    groupContact: string
    backToTop: string
    empty: string
  }
  guide: {
    aria: string
    titlePre: string
    titleEm: string
    rows: readonly GuideRow[]
  }
  status: {
    coreOnline: string
    nodes: string
    signalActive: string
    systemReady: string
  }
  cursor: {
    view: string
    open: string
    go: string
    drag: string
    rotate: string
    node: string
    language: string
  }
  language: {
    aria: string
    uz: string
    ru: string
    en: string
    uzFull: string
    ruFull: string
    enFull: string
  }
  socials: {
    email: string
  }
}