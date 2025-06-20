import React, { useState, useRef, useEffect } from 'react'
import { ModalManager, ModalState } from '../../hooks/useModalManager'

interface ModalLauncherProps {
  modalManager: ModalManager
}

interface AvailableModal {
  id: string
  title: string
  category: ModalState['category']
  icon: string
  description?: string
  component: React.ComponentType<any>
  defaultProps?: any
  defaultPosition?: { x: number; y: number }
  defaultSize?: { width: number; height: number }
  minimumSize?: { width: number; height: number }
  maximumSize?: { width: number; height: number }
}

// Registry of all available modals
const AVAILABLE_MODALS: AvailableModal[] = [
  {
    id: 'task-manager',
    title: 'Task Manager',
    category: 'task',
    icon: '📋',
    description: 'Manage all your tasks and projects',
    component: React.lazy(() => import('../dashboard/TaskManagerModal')),
    defaultSize: { width: 900, height: 700 },
    minimumSize: { width: 600, height: 400 }
  },
  {
    id: 'quick-capture',
    title: 'Quick Capture',
    category: 'task',
    icon: '💡',
    description: 'Capture ideas and thoughts quickly',
    component: React.lazy(() => import('../dashboard/ActionButtons')),
    defaultSize: { width: 500, height: 400 },
    minimumSize: { width: 400, height: 300 }
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    category: 'ai',
    icon: '🤖',
    description: 'Get AI-powered assistance',
    component: React.lazy(() => import('../ai/AIAssistantModal')),
    defaultSize: { width: 700, height: 600 },
    minimumSize: { width: 500, height: 400 }
  },
  {
    id: 'system-status',
    title: 'System Status',
    category: 'system',
    icon: '⚡',
    description: 'Monitor system health and performance',
    component: React.lazy(() => import('../dashboard/SystemStatusModal')),
    defaultSize: { width: 800, height: 500 },
    minimumSize: { width: 600, height: 300 }
  },
  {
    id: 'settings',
    title: 'Settings',
    category: 'settings',
    icon: '⚙️',
    description: 'Configure application settings',
    component: React.lazy(() => import('../settings/SettingsModal')),
    defaultSize: { width: 600, height: 500 },
    minimumSize: { width: 500, height: 400 }
  },
  {
    id: 'whoop-insights',
    title: 'WHOOP Insights',
    category: 'system',
    icon: '💪',
    description: 'View health and fitness data',
    component: React.lazy(() => import('../dashboard/WhoopInsightsWidget')),
    defaultSize: { width: 700, height: 500 },
    minimumSize: { width: 500, height: 400 }
  },
  {
    id: 'chaos-detector',
    title: 'Chaos Detector',
    category: 'ai',
    icon: '🌪️',
    description: 'Monitor productivity chaos levels',
    component: React.lazy(() => import('../dashboard/ChaosIndicator')),
    defaultSize: { width: 500, height: 400 },
    minimumSize: { width: 400, height: 300 }
  }
]

const CATEGORY_COLORS = {
  task: 'bg-blue-100 text-blue-800 border-blue-200',
  ai: 'bg-purple-100 text-purple-800 border-purple-200',
  system: 'bg-green-100 text-green-800 border-green-200',
  settings: 'bg-gray-100 text-gray-800 border-gray-200',
  general: 'bg-orange-100 text-orange-800 border-orange-200'
}

export default function ModalLauncher({ modalManager }: ModalLauncherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ModalState['category'] | 'all'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filter modals based on search and category
  const filteredModals = AVAILABLE_MODALS.filter(modal => {
    const matchesSearch = modal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         modal.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || modal.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get modal states for display
  const openModals = modalManager.getModalsByState('open')
  const minimizedModals = modalManager.getModalsByState('minimized')
  const closedModals = modalManager.getModalsByState('closed')

  const getModalState = (modalId: string): ModalState['state'] | 'closed' => {
    const modal = modalManager.modals.find(m => m.id === modalId)
    return modal?.state || 'closed'
  }

  const handleModalLaunch = (availableModal: AvailableModal) => {
    const existingModal = modalManager.modals.find(m => m.id === availableModal.id)
    
    if (existingModal) {
      if (existingModal.state === 'minimized') {
        modalManager.restoreModal(availableModal.id)
      } else if (existingModal.state === 'closed') {
        modalManager.restoreModal(availableModal.id)
      } else {
        modalManager.bringToFront(availableModal.id)
      }
    } else {
      modalManager.openModal({
        id: availableModal.id,
        title: availableModal.title,
        component: availableModal.component,
        props: availableModal.defaultProps || {},
        position: availableModal.defaultPosition || { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        size: availableModal.defaultSize || { width: 600, height: 400 },
        category: availableModal.category,
        icon: availableModal.icon,
        minimumSize: availableModal.minimumSize,
        maximumSize: availableModal.maximumSize,
        defaultPosition: availableModal.defaultPosition,
        defaultSize: availableModal.defaultSize,
        isMaximized: false
      })
    }
    
    setIsOpen(false)
  }

  const getStateIndicator = (state: ModalState['state'] | 'closed') => {
    switch (state) {
      case 'open':
        return <div className="w-2 h-2 bg-green-400 rounded-full" title="Open" />
      case 'minimized':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Minimized" />
      case 'closed':
        return <div className="w-2 h-2 bg-gray-300 rounded-full" title="Closed" />
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" title="Closed" />
    }
  }

  const categoryOptions: Array<{ value: ModalState['category'] | 'all'; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'task', label: 'Tasks' },
    { value: 'ai', label: 'AI & Automation' },
    { value: 'system', label: 'System' },
    { value: 'settings', label: 'Settings' },
    { value: 'general', label: 'General' }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-200 hover:border-blue-300 rounded-xl shadow-sm hover:shadow-md transition-all group"
        title="Open Modal Launcher"
        aria-label="Open Modal Launcher"
      >
        <div className="text-xl group-hover:scale-110 transition-transform">🚀</div>
        <div className="text-left">
          <div className="font-medium text-slate-800">Launch</div>
          <div className="text-xs text-slate-500">
            {openModals.length}O • {minimizedModals.length}M • {closedModals.length}C
          </div>
        </div>
        <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">🚀 Modal Launcher</h3>
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {openModals.length} Open
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  {minimizedModals.length} Min
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  {closedModals.length} Closed
                </span>
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search modals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Modal List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredModals.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm">No modals found</div>
              </div>
            ) : (
              <div className="p-2">
                {filteredModals.map((modal) => {
                  const state = getModalState(modal.id)
                  return (
                    <button
                      key={modal.id}
                      onClick={() => handleModalLaunch(modal)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                    >
                      {/* State Indicator */}
                      {getStateIndicator(state)}

                      {/* Icon */}
                      <div className="text-xl">{modal.icon}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-slate-800 truncate">
                            {modal.title}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full border ${CATEGORY_COLORS[modal.category]}`}>
                            {modal.category}
                          </span>
                        </div>
                        {modal.description && (
                          <div className="text-xs text-slate-500 truncate mt-1">
                            {modal.description}
                          </div>
                        )}
                      </div>

                      {/* Action Hint */}
                      <div className="text-xs text-slate-400">
                        {state === 'open' ? 'Focus' : state === 'minimized' ? 'Restore' : 'Launch'}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500 text-center">
              💡 Double-click modals to reset position • Right-click for context menu
            </div>
          </div>
        </div>
      )}
    </div>
  )
}