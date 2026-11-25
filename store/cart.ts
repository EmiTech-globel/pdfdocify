'use client'
import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
export type Line = {type: 'product' | 'bundle'; slug: string; title: string; price: number; color?: string; image?: string; meta?: string}
type State = {lines: Line[]; add: (l: Line) => void; remove: (type: Line['type'], slug: string) => void; clear: () => void}
// Display only. The server re-reads every price from Sanity at checkout.
export const useCart = create<State>()(persist((set) => ({
  lines: [],
  add: (l) => set((s) => (s.lines.some((x) => x.type === l.type && x.slug === l.slug) ? s : {lines: [...s.lines, l]})),
  remove: (type, slug) => set((s) => ({lines: s.lines.filter((x) => !(x.type === type && x.slug === slug))})),
  clear: () => set({lines: []}),
}), {
  name: 'store-cart',
  // No localStorage on the server, which also silences Node's localStorage warning in the Vercel logs.
  storage: createJSONStorage(() => (typeof window === 'undefined' ? {getItem: () => null, setItem: () => undefined, removeItem: () => undefined} : window.localStorage)),
}))
