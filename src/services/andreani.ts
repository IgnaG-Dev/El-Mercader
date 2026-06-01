import { supabase } from '../lib/supabase'

export interface AndreaniTarifa {
  costo: number
  diasHabiles: string
  servicio: string
}

// Average weight/volume for a board game box (grams / cm³)
const DEFAULT_PESO    = 1200
const DEFAULT_VOLUMEN = 3000

export async function cotizarAndreani(
  cpDestino: string,
  pesoGramos = DEFAULT_PESO,
  volumenCm3 = DEFAULT_VOLUMEN,
): Promise<AndreaniTarifa | null> {
  const cp = cpDestino.replace(/\D/g, '')
  if (cp.length < 4) return null

  try {
    const { data, error } = await supabase.functions.invoke('andreani-tarifa', {
      body: { cpDestino: cp, peso: pesoGramos, volumen: volumenCm3 },
    })

    if (error || !data || data.error) return null
    return data as AndreaniTarifa
  } catch {
    return null
  }
}
