import { useState, useCallback, useRef, useEffect } from 'react'

export interface ModalState {
  id: string
  title: string
  component: React.ComponentType<any>
  props?: any
  state: 'open' | 'minimized' | 'closed'
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  isMaximized: boolean
  category: 'task' | 'ai' | 'system' | 'settings' | 'general'
  icon?: string
  minimumSize?: { width: number; height: number }
  maximumSize?: { width: number; height: number }
  defaultPosition?: { x: number; y: number }
  defaultSize?: { width: number; height: number }
}

export interface ModalManager {
  modals: ModalState[]
  openModal: (modal: Omit<ModalState, 'state' | 'zIndex'>) => void
  closeModal: (id: string) => void
  minimizeModal: (id: string) => void
  restoreModal: (id: string) => void
  maximizeModal: (id: string) => void
  updateModalPosition: (id: string, position: { x: number; y: number }) => void
  updateModalSize: (id: string, size: { width: number; height: number }) => void
  bringToFront: (id: string) => void
  getModalsByState: (state: ModalState['state']) => ModalState[]
  resetModalToDefault: (id: string) => void
  saveModalStates: () => void
  loadModalStates: () => void
  clearAllModals: () => void
}

const STORAGE_KEY = 'rhythmiq-modal-states'
const BASE_Z_INDEX = 1000
const SNAP_THRESHOLD = 20

export function useModalManager(): ModalManager {
  const [modals, setModals] = useState<ModalState[]>([])
  const nextZIndex = useRef(BASE_Z_INDEX)

  // Load modal states on mount
  useEffect(() => {
    loadModalStates()
  }, [])

  // Auto-save modal states when they change
  useEffect(() => {
    if (modals.length > 0) {
      saveModalStates()
    }
  }, [modals])

  const openModal = useCallback((modal: Omit<ModalState, 'state' | 'zIndex'>) => {
    setModals(prev => {
      const existing = prev.find(m => m.id === modal.id)
      if (existing) {
        // If already exists, just restore and bring to front
        return prev.map(m => 
          m.id === modal.id 
            ? { ...m, state: 'open', zIndex: nextZIndex.current++ }
            : m
        )
      } else {
        // Add new modal
        const newModal: ModalState = {
          ...modal,
          state: 'open',
          zIndex: nextZIndex.current++,
          position: modal.position || modal.defaultPosition || { x: 100, y: 100 },
          size: modal.size || modal.defaultSize || { width: 600, height: 400 },
          isMaximized: false
        }
        return [...prev, newModal]
      }
    })
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.map(m => 
      m.id === id ? { ...m, state: 'closed' } : m
    ))
  }, [])

  const minimizeModal = useCallback((id: string) => {
    setModals(prev => prev.map(m => 
      m.id === id ? { ...m, state: 'minimized' } : m
    ))
  }, [])

  const restoreModal = useCallback((id: string) => {
    setModals(prev => prev.map(m => 
      m.id === id 
        ? { ...m, state: 'open', zIndex: nextZIndex.current++, isMaximized: false }
        : m
    ))
  }, [])

  const maximizeModal = useCallback((id: string) => {
    setModals(prev => prev.map(m => {
      if (m.id === id) {
        if (m.isMaximized) {
          // Restore to previous size/position
          return {
            ...m,
            isMaximized: false,
            position: m.defaultPosition || { x: 100, y: 100 },
            size: m.defaultSize || { width: 600, height: 400 }
          }
        } else {
          // Maximize to full screen (minus taskbar)
          return {
            ...m,
            isMaximized: true,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight - 80 }
          }
        }
      }
      return m
    }))
  }, [])

  const updateModalPosition = useCallback((id: string, position: { x: number; y: number }) => {
    // Apply snap zones
    const snappedPosition = {
      x: position.x < SNAP_THRESHOLD ? 0 : position.x,
      y: position.y < SNAP_THRESHOLD ? 0 : position.y
    }

    // Bounds checking
    const maxX = window.innerWidth - 200 // Minimum visible width
    const maxY = window.innerHeight - 100 // Minimum visible height
    
    const boundedPosition = {
      x: Math.min(Math.max(snappedPosition.x, -150), maxX),
      y: Math.min(Math.max(snappedPosition.y, 0), maxY)
    }

    setModals(prev => prev.map(m => 
      m.id === id ? { ...m, position: boundedPosition } : m
    ))
  }, [])

  const updateModalSize = useCallback((id: string, size: { width: number; height: number }) => {
    setModals(prev => prev.map(m => {
      if (m.id === id) {
        const minSize = m.minimumSize || { width: 300, height: 200 }
        const maxSize = m.maximumSize || { width: window.innerWidth, height: window.innerHeight }
        
        const boundedSize = {
          width: Math.min(Math.max(size.width, minSize.width), maxSize.width),
          height: Math.min(Math.max(size.height, minSize.height), maxSize.height)
        }
        
        return { ...m, size: boundedSize }
      }
      return m
    }))
  }, [])

  const bringToFront = useCallback((id: string) => {
    setModals(prev => prev.map(m => 
      m.id === id ? { ...m, zIndex: nextZIndex.current++ } : m
    ))
  }, [])

  const getModalsByState = useCallback((state: ModalState['state']) => {
    return modals.filter(m => m.state === state)
  }, [modals])

  const resetModalToDefault = useCallback((id: string) => {
    setModals(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          position: m.defaultPosition || { x: 100, y: 100 },
          size: m.defaultSize || { width: 600, height: 400 },
          isMaximized: false
        }
      }
      return m
    }))
  }, [])

  const saveModalStates = useCallback(() => {
    try {
      const statesToSave = modals.map(({ component, props, ...state }) => state)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statesToSave))
    } catch (error) {
      console.error('Failed to save modal states:', error)
    }
  }, [modals])

  const loadModalStates = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const states = JSON.parse(saved)
        // Note: Components and props need to be re-registered when modals are opened
        // This just loads the position/size/state data
        console.log('Loaded modal states:', states)
      }
    } catch (error) {
      console.error('Failed to load modal states:', error)
    }
  }, [])

  const clearAllModals = useCallback(() => {
    setModals([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    modals,
    openModal,
    closeModal,
    minimizeModal,
    restoreModal,
    maximizeModal,
    updateModalPosition,
    updateModalSize,
    bringToFront,
    getModalsByState,
    resetModalToDefault,
    saveModalStates,
    loadModalStates,
    clearAllModals
  }
}