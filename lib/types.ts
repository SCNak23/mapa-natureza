export type ParkStatus = 'pending' | 'approved'

export interface Park {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  address: string | null
  trees: string[]
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
  status: ParkStatus
  suggested_by: string | null
  created_at: string
}

export type NewPark = Omit<Park, 'id' | 'created_at' | 'status'>
export type NewPlayIdea = Omit<PlayIdea, 'id' | 'created_at' | 'status'>
