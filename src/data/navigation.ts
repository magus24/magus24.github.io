export interface MenuItem {
  index: string
  label: string
  target: string
}

export const MENU_ITEMS: MenuItem[] = [
  { index: '01', label: 'HUMAN MIND', target: 'mind' },
  { index: '02', label: 'THE IDEA', target: 'idea' },
  { index: '03', label: 'THE TRANSFER', target: 'transfer' },
  { index: '04', label: 'INTELLIGENCE', target: 'ai' },
  { index: '05', label: 'EXECUTION', target: 'execution' },
  { index: '06', label: 'PROJECTS', target: 'work' },
  { index: '07', label: 'EXPERIMENTS', target: 'experiments' },
  { index: '08', label: 'ABOUT', target: 'about' },
  { index: '09', label: 'CONTACT', target: 'contact' },
]

/**
 * The page is one connected journey: a human thought becomes an idea,
 * crosses into a machine network, is executed into a product, and unfolds
 * into the work itself.
 */
export const SECTIONS = [
  'mind',
  'idea',
  'transfer',
  'ai',
  'execution',
  'work',
  'experiments',
  'about',
  'contact',
] as const

export type SectionId = (typeof SECTIONS)[number]
