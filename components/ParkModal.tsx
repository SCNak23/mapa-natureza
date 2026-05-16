'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Park, PlayIdea } from '@/lib/types'
import SuggestIdeaForm from './SuggestIdeaForm'

interface Props {
  park: Park
  onClose: () => void
}

export default function ParkModal({ park, onClose }: Props) {
  const [ideas, setIdeas] = useState<PlayIdea[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    supabase
      .from('play_ideas')
      .select('*')
      .eq('park_id', park.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => setIdeas(data ?? []))
  }, [park.id])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-green-700 text-white rounded-t-2xl p-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{park.name}</h2>
            {park.address && <p className="text-green-100 text-sm mt-1">{park.address}</p>}
          </div>
          <button onClick={onClose} className="ml-4 text-white/80 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Description */}
          {park.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{park.description}</p>
          )}

          {/* Trees */}
          {park.trees?.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                🌿 Árvores identificadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {park.trees.map((tree) => (
                  <span key={tree} className="bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-1 rounded-full">
                    {tree}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Play ideas */}
          <div>
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              🎮 Brincadeiras com a natureza
            </h3>
            {ideas.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Nenhuma brincadeira cadastrada ainda. Seja o primeiro!</p>
            ) : (
              <div className="space-y-3">
                {ideas.map((idea) => (
                  <div key={idea.id} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-900">{idea.title}</h4>
                    <p className="text-amber-800 text-sm mt-1 leading-relaxed">{idea.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-amber-600">
                      {idea.age_range && <span>👶 {idea.age_range}</span>}
                      {idea.materials && <span>🧺 {idea.materials}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggest idea */}
          {showForm ? (
            <SuggestIdeaForm parkId={park.id} onDone={() => setShowForm(false)} />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full border-2 border-dashed border-green-300 text-green-700 rounded-xl py-3 text-sm font-medium hover:bg-green-50 transition-colors"
            >
              + Sugerir uma brincadeira
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
