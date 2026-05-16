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
  status: ParkStatus
  suggested_by: string | null
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

export const PARK_AMENITIES = [
  { id: 'banheiro', label: 'Banheiro', emoji: '🚿' },
  { id: 'bebedouro', label: 'Bebedouro', emoji: '💧' },
  { id: 'trilha', label: 'Trilha', emoji: '🥾' },
  { id: 'area_sombreada', label: 'Área sombreada', emoji: '🌿' },
  { id: 'bancos', label: 'Bancos', emoji: '🪵' },
  { id: 'mesa', label: 'Mesa', emoji: '🍃' },
  { id: 'gramado', label: 'Gramado', emoji: '🌱' },
]

export type NewPark = Omit<Park, 'id' | 'created_at' | 'status'>
export type NewPlayIdea = Omit<PlayIdea, 'id' | 'created_at' | 'status'>
