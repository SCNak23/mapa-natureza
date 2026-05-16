'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Park, PlayIdea } from '@/lib/types'
import { TREE_PARTS, PARK_AMENITIES } from '@/lib/types'
import SuggestIdeaForm from './SuggestIdeaForm'
import SuggestParkUpdateForm from './SuggestParkUpdateForm'

interface Props {
  park: Park
  onClose: () => void
}

export default function ParkModal({ park, onClose }: Props) {
  const [ideas, setIdeas] = useState<PlayIdea[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null)

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '32rem', maxHeight: '90dvh', overflowY: 'auto' }}
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

          {/* Amenidades */}
          {(park.amenities?.length ?? 0) > 0 && (
            <div>
              <h3 className="font-semibold text-green-800 mb-2">O que tem aqui</h3>
              <div className="flex flex-wrap gap-2">
                {(park.amenities ?? []).map((id) => {
                  const item = PARK_AMENITIES.find((a) => a.id === id)
                  return item ? (
                    <span key={id} className="bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-1 rounded-full">
                      {item.emoji} {item.label}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Trees */}
          {park.trees?.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-800 mb-2">🌳 Árvores identificadas</h3>
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
            <h3 className="font-semibold text-green-800 mb-3">🌱 Brincadeiras com a natureza</h3>
            {ideas.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Nenhuma brincadeira cadastrada ainda. Seja o primeiro!</p>
            ) : (
              <div className="space-y-2">
                {ideas.map((idea) => {
                  const isOpen = expandedIdea === idea.id
                  return (
                    <div key={idea.id} className="bg-amber-50 border border-amber-100 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedIdea(isOpen ? null : idea.id)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-amber-900 text-sm">{idea.title}</h4>
                          {idea.age_range && (
                            <span className="text-xs text-amber-600">🌿 {idea.age_range}</span>
                          )}
                        </div>
                        <span className="text-amber-400 text-lg leading-none shrink-0">
                          {isOpen ? '▾' : '▸'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-amber-100">
                          <p className="text-amber-800 text-sm mt-3 leading-relaxed">{idea.description}</p>
                          {idea.tree_parts?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {idea.tree_parts.map((partId) => {
                                const part = TREE_PARTS.find((p) => p.id === partId)
                                return part ? (
                                  <span key={partId} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                    {part.emoji} {part.label}
                                  </span>
                                ) : null
                              })}
                            </div>
                          )}
                          {idea.materials && (
                            <p className="text-xs text-amber-600 mt-2">🍃 {idea.materials}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
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

          {/* Suggest update */}
          {showUpdateForm ? (
            <SuggestParkUpdateForm parkId={park.id} parkName={park.name} onDone={() => setShowUpdateForm(false)} />
          ) : (
            <button
              onClick={() => setShowUpdateForm(true)}
              className="w-full text-xs text-gray-400 hover:text-amber-600 py-2 transition-colors"
            >
              ✏️ Sugerir correção ou nova espécie
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
