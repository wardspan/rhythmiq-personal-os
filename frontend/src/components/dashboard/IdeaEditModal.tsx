import React, { useState, useEffect, useCallback } from 'react'

interface Idea {
  id: string
  title: string
  description?: string
  status: 'active' | 'dormant' | 'archived'
  category?: string
  tags: string[]
  ai_enriched?: boolean
  ai_enrichment_data?: {
    keywords?: string[]
    research?: string
    connections?: string[]
    potential?: string
  }
  origin?: string
  next_step?: string
  created_at: string
  updated_at?: string
}

interface IdeaEditModalProps {
  idea: Idea | null
  isOpen: boolean
  onClose: () => void
  onSave: (ideaId: string, updates: Partial<Idea>) => Promise<void>
}

export default function IdeaEditModal({ idea, isOpen, onClose, onSave }: IdeaEditModalProps) {
  const [formData, setFormData] = useState<Partial<Idea>>({})
  const [originalData, setOriginalData] = useState<Partial<Idea>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [showAIEnrichment, setShowAIEnrichment] = useState(false)

  // Initialize form data when idea changes
  useEffect(() => {
    if (idea && isOpen) {
      const initialData = {
        title: idea.title || '',
        description: idea.description || '',
        status: idea.status,
        category: idea.category || '',
        tags: idea.tags || [],
        origin: idea.origin || '',
        next_step: idea.next_step || '',
        ai_enrichment_data: idea.ai_enrichment_data || {
          keywords: [],
          research: '',
          connections: [],
          potential: ''
        }
      }
      setFormData(initialData)
      setOriginalData(initialData)
      setIsDirty(false)
      setErrors({})
      setShowAIEnrichment(idea.ai_enriched || false)
    }
  }, [idea, isOpen])

  // Track changes
  useEffect(() => {
    if (idea && Object.keys(originalData).length > 0) {
      const hasChanges = Object.keys(formData).some(key => {
        const current = formData[key as keyof typeof formData]
        const original = originalData[key as keyof typeof originalData]
        return JSON.stringify(current) !== JSON.stringify(original)
      })
      setIsDirty(hasChanges)
    }
  }, [formData, originalData, idea])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDirty])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleAIEnrichmentChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ai_enrichment_data: {
        ...prev.ai_enrichment_data,
        [field]: value
      }
    }))
  }

  const handleAIKeywordsChange = (keywordsString: string) => {
    const keywords = keywordsString.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0)
    handleAIEnrichmentChange('keywords', keywords)
  }

  const handleAIConnectionsChange = (connectionsString: string) => {
    const connections = connectionsString.split(',').map(conn => conn.trim()).filter(conn => conn.length > 0)
    handleAIEnrichmentChange('connections', connections)
  }

  const handleSave = async () => {
    if (!idea || !validateForm()) return

    setIsSaving(true)
    try {
      const updates = {
        ...formData,
        ai_enriched: showAIEnrichment && Object.values(formData.ai_enrichment_data || {}).some(val => 
          Array.isArray(val) ? val.length > 0 : Boolean(val)
        )
      }

      await onSave(idea.id, updates)
      setIsDirty(false)
      onClose()
    } catch (error) {
      console.error('Error saving idea:', error)
      setErrors({ general: 'Failed to save idea. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (isDirty) {
      setShowConfirmClose(true)
    } else {
      onClose()
    }
  }

  const confirmClose = () => {
    setShowConfirmClose(false)
    setIsDirty(false)
    onClose()
  }

  const getStatusIcon = (status: Idea['status']) => {
    switch (status) {
      case 'active': return '🟢'
      case 'dormant': return '🟡'
      case 'archived': return '📦'
      default: return '⚪'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'hardware': return '🔧'
      case 'software': return '💻'
      case 'business': return '💼'
      case 'writing': return '✍️'
      case 'design': return '🎨'
      case 'research': return '🔬'
      default: return '💡'
    }
  }

  if (!isOpen || !idea) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-800">💡 Edit Idea</h2>
              <p className="text-sm text-slate-500 mt-1">
                {isDirty ? 'Unsaved changes' : 'No changes'} • Ctrl+S to save • Esc to close
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 text-xl"
              aria-label="Close edit modal"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Idea Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter a catchy title for your idea..."
                autoFocus
              />
              {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none ${
                  errors.description ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
              />
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Status and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as Idea['status'])}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">🟢 Active - Currently exploring</option>
                  <option value="dormant">🟡 Dormant - On hold</option>
                  <option value="archived">📦 Archived - No longer pursuing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  <option value="hardware">🔧 Hardware</option>
                  <option value="software">💻 Software</option>
                  <option value="business">💼 Business</option>
                  <option value="writing">✍️ Writing</option>
                  <option value="design">🎨 Design</option>
                  <option value="research">🔬 Research</option>
                  <option value="other">🌟 Other</option>
                </select>
              </div>
            </div>

            {/* Origin and Next Step Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Origin <span className="text-slate-500">(where did this idea come from?)</span>
                </label>
                <input
                  type="text"
                  value={formData.origin || ''}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. brainstorm session, shower thought, book"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Next Step <span className="text-slate-500">(what should happen next?)</span>
                </label>
                <input
                  type="text"
                  value={formData.next_step || ''}
                  onChange={(e) => handleInputChange('next_step', e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. research market, create prototype, validate"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags <span className="text-slate-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. innovation, mobile, productivity"
              />
            </div>

            {/* AI Enrichment Section */}
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-800">🤖 AI Enrichment Data</h3>
                <button
                  type="button"
                  onClick={() => setShowAIEnrichment(!showAIEnrichment)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showAIEnrichment ? 'Hide' : 'Show'} AI Data
                </button>
              </div>

              {showAIEnrichment && (
                <div className="space-y-4">
                  <div className="text-sm text-slate-600 mb-4">
                    This data can be automatically populated by AI analysis or manually edited.
                  </div>

                  {/* AI Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Keywords <span className="text-slate-500">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ai_enrichment_data?.keywords?.join(', ') || ''}
                      onChange={(e) => handleAIKeywordsChange(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. automation, efficiency, user experience"
                    />
                  </div>

                  {/* AI Research */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Research Notes
                    </label>
                    <textarea
                      value={formData.ai_enrichment_data?.research || ''}
                      onChange={(e) => handleAIEnrichmentChange('research', e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                      placeholder="Research findings, market analysis, technical feasibility..."
                    />
                  </div>

                  {/* AI Connections */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Related Ideas/Connections <span className="text-slate-500">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ai_enrichment_data?.connections?.join(', ') || ''}
                      onChange={(e) => handleAIConnectionsChange(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. similar products, related concepts, potential synergies"
                    />
                  </div>

                  {/* AI Potential */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Potential Assessment
                    </label>
                    <textarea
                      value={formData.ai_enrichment_data?.potential || ''}
                      onChange={(e) => handleAIEnrichmentChange('potential', e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                      placeholder="Market potential, technical challenges, success probability..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500">
              Created: {new Date(idea.created_at).toLocaleDateString()}
              {idea.updated_at && (
                <span className="ml-3">
                  Last updated: {new Date(idea.updated_at).toLocaleDateString()}
                </span>
              )}
              {idea.ai_enriched && (
                <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  🤖 AI Enhanced
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || isSaving || Object.keys(errors).length > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Close Dialog */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-3">Unsaved Changes</h3>
            <p className="text-slate-600 mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={confirmClose}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}