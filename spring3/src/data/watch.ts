import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

let watched = new Set<string>()
let snapshot: string[] = []

function publish() {
  snapshot = [...watched].sort()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

export function useWatchedSlugs() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function isWatching(slug: string) {
  return watched.has(slug)
}

export function toggleWatch(slug: string) {
  if (watched.has(slug)) {
    watched.delete(slug)
  } else {
    watched.add(slug)
  }
  publish()
}
