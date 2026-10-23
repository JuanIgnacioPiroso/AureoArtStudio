/**
 * Logos e imágenes del usuario. Viven sólo en este navegador (IndexedDB): el enlace del diseño
 * guarda el id, no el archivo. Si IndexedDB no está disponible, duran lo que dura la pestaña.
 */
const DB_NAME = 'aureo-lab-assets'
const STORE = 'assets'

export type AssetStatus = 'ready' | 'loading' | 'missing'

const images = new Map<string, CanvasImageSource>()
const blobs = new Map<string, Blob>()
const status = new Map<string, AssetStatus>()
const listeners = new Set<() => void>()
let version = 0

function bump() {
  version++
  listeners.forEach((l) => l())
}

export function subscribeAssets(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function assetsVersion(): number {
  return version
}

let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  dbPromise ??= new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null)
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

async function idb<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  const db = await openDb()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const req = run(db.transaction(STORE, mode).objectStore(STORE))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function decode(blob: Blob): Promise<CanvasImageSource> {
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob)
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function hash(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  try {
    const digest = await crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // Sin SubtleCrypto (contexto no seguro): FNV-1a sobre los bytes.
    let h = 0x811c9dc5
    for (const b of new Uint8Array(buf)) h = Math.imul(h ^ b, 0x01000193)
    return `f${(h >>> 0).toString(16)}${buf.byteLength.toString(16)}`
  }
}

/** Guarda una imagen (PNG ya normalizado) y devuelve su id. */
export async function saveAsset(blob: Blob): Promise<string> {
  const id = await hash(blob)
  if (!images.has(id)) {
    images.set(id, await decode(blob))
    blobs.set(id, blob)
    status.set(id, 'ready')
    await idb('readwrite', (s) => s.put(blob, id))
    bump()
  }
  return id
}

/** Imagen decodificada, si ya está en memoria. Pide cargarla si no. */
export function getAssetImage(id: string): CanvasImageSource | null {
  const img = images.get(id)
  if (img) return img
  void requestAsset(id)
  return null
}

export function assetStatus(id: string): AssetStatus {
  return status.get(id) ?? 'loading'
}

/** Carga desde IndexedDB una imagen guardada en una sesión anterior. */
export async function requestAsset(id: string): Promise<void> {
  if (status.has(id)) return
  status.set(id, 'loading')
  const blob = await idb<Blob | undefined>('readonly', (s) => s.get(id) as IDBRequest<Blob | undefined>)
  if (blob instanceof Blob) {
    try {
      images.set(id, await decode(blob))
      blobs.set(id, blob)
      status.set(id, 'ready')
    } catch {
      status.set(id, 'missing')
    }
  } else {
    status.set(id, 'missing')
  }
  bump()
}

export async function getAssetBlob(id: string): Promise<Blob | null> {
  if (blobs.has(id)) return blobs.get(id)!
  await requestAsset(id)
  return blobs.get(id) ?? null
}
