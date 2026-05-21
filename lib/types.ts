export type ParkStatus = 'pending' | 'approved'

export interface Park {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  address: string | null
  trees: string[]
  amenities: string[] | null
  suitable_for: string[] | null
  status: ParkStatus
  suggested_by: string | null
  email: string | null
  created_at: string
}

export interface PlayIdea {
  id: string
  park_id: string
  title: string
  description: string
  age_range: string | null
  materials: string | null
  tree_parts: string[]
  status: ParkStatus
  suggested_by: string | null
  email: string | null
  created_at: string
}

export const TREE_PARTS = [
  { id: 'semente', label: 'Semente', emoji: '🌰' },
  { id: 'fruto', label: 'Fruto', emoji: '🍎' },
  { id: 'flor', label: 'Flor', emoji: '🌸' },
  { id: 'graveto', label: 'Graveto', emoji: '🪵' },
  { id: 'tronco', label: 'Tronco / casca', emoji: '🌲' },
  { id: 'raiz', label: 'Raízes', emoji: '🌿' },
  { id: 'folha', label: 'Folha', emoji: '🍃' },
]

export const SUITABLE_FOR = [
  { id: 'familias', label: 'Famílias', emoji: '👨‍👩‍👧' },
  { id: 'escolas', label: 'Escolas e grupos', emoji: '🏫' },
]

export const PARK_AMENITIES = [
  { id: 'banheiro', label: 'Banheiro', emoji: '🚽' },
  { id: 'agua_beber', label: 'Água para beber', emoji: '💧' },
  { id: 'agua_brincar', label: 'Água para brincar', emoji: '💦' },
  { id: 'trilha', label: 'Trilha / pista', emoji: '🥾' },
  { id: 'bosque', label: 'Bosque', emoji: '🌲' },
  { id: 'barranco', label: 'Barranco', emoji: '⛰️' },
  { id: 'area_sombreada', label: 'Área sombreada', emoji: '🌿' },
  { id: 'poucas_arvores', label: 'Poucas árvores', emoji: '🌳' },
  { id: 'contemplacao', label: 'Área de contemplação e descanso', emoji: '🪵' },
  { id: 'piquenique', label: 'Área de piquenique', emoji: '🧺' },
  { id: 'gramado', label: 'Gramado', emoji: '🌱' },
  { id: 'aves', label: 'Observar aves', emoji: '🐦' },
  { id: 'naturalizado', label: 'Parque naturalizado', emoji: '🌾' },
]

export interface ParkSuggestion {
  id: string
  park_id: string
  message: string
  suggested_by: string | null
  status: 'pending' | 'reviewed'
  created_at: string
}

export type NewPark = Omit<Park, 'id' | 'created_at' | 'status'>
export type NewPlayIdea = Omit<PlayIdea, 'id' | 'created_at' | 'status'>
