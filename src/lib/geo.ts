import { PROVINCES } from '../constants/provinces'

export function mapNominatimState(state: string): string {
  const explicit: Record<string, string> = {
    'Ciudad Autónoma de Buenos Aires': 'CABA',
    'Ciudad de Buenos Aires':          'CABA',
    'Autonomous City of Buenos Aires': 'CABA',
    'Province of Buenos Aires':        'Buenos Aires',
    'Provincia de Buenos Aires':       'Buenos Aires',
  }
  if (explicit[state]) return explicit[state]
  if (PROVINCES.includes(state)) return state
  const lower = state.toLowerCase()
  return PROVINCES.find((p) => p.toLowerCase() === lower) ?? ''
}

export function extractStreet(addr: Record<string, string>): string {
  const roadName =
    addr.road ?? addr.pedestrian ?? addr.footway ??
    addr.cycleway ?? addr.path ?? addr.residential ?? ''
  return [roadName, addr.house_number].filter(Boolean).join(' ')
}

export interface GeoResult {
  street: string
  city: string
  province: string
  postalCode: string
  provinceWarning: boolean
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoResult> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}&accept-language=es`,
  )
  if (!res.ok) throw new Error('geocoding_failed')
  const data = await res.json()
  const addr: Record<string, string> = data.address ?? {}

  const street     = extractStreet(addr)
  const city       = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.suburb ?? addr.quarter ?? ''
  const postalCode = (addr.postcode ?? '').replace(/\s/g, '')
  const province   = mapNominatimState(addr.state ?? '')

  return { street, city, postalCode, province, provinceWarning: !province }
}
