import React, { Suspense } from 'react'
import { useModalManager } from '../../hooks/useModalManager'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import DraggableResizableModal from './DraggableResizableModal'
import ModalLauncher from './ModalLauncher'
import ModalTaskbar from './ModalTaskbar'

interface ModalManagerProviderProps {
  children: React.ReactNode
}

// Create a context for sharing the modal manager
export const ModalManagerContext = React.createContext<ReturnType<typeof useModalManager> | null>(null)

// Hook to use the modal manager in any component
export function useModalManagerContext() {
  const context = React.useContext(ModalManagerContext)
  if (!context) {
    throw new Error('useModalManagerContext must be used within a ModalManagerProvider')
  }
  return context
}

export function ModalManagerProvider({ children }: ModalManagerProviderProps) {
  const modalManager = useModalManager()
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts({ modalManager, enabled: true })

  return (
    <ModalManagerContext.Provider value={modalManager}>
      {children}
      
      {/* Render all open modals */}
      {modalManager.modals
        .filter(modal => modal.state === 'open')
        .map(modal => (
          <Suspense
            key={modal.id}
            fallback={
              <div 
                className="fixed bg-white border border-slate-300 rounded-xl shadow-xl p-8 flex items-center justify-center"
                style={{
                  left: modal.position.x,
                  top: modal.position.y,
                  width: modal.size.width,
                  height: modal.size.height,
                  zIndex: modal.zIndex
                }}
              >
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="animate-spin text-2xl">⏳</div>
                  <div>Loading {modal.title}...</div>
                </div>
              </div>
            }
          >
            <DraggableResizableModal
              modal={modal}
              modalManager={modalManager}
            >
              <modal.component {...modal.props} modalManager={modalManager} />
            </DraggableResizableModal>
          </Suspense>
        ))}
      
      {/* Modal Taskbar for minimized modals */}
      <ModalTaskbar modalManager={modalManager} />
    </ModalManagerContext.Provider>
  )
}

// Standalone Modal Launcher component that can be placed anywhere
export function ModalLauncherComponent() {
  const modalManager = useModalManagerContext()
  return <ModalLauncher modalManager={modalManager} />
}

// Quick access functions for common modal operations
export function useModalControls() {
  const modalManager = useModalManagerContext()
  
  return {
    // Quick launchers for common modals
    openTaskManager: () => modalManager.openModal({
      id: 'task-manager',
      title: 'Task Manager',
      component: React.lazy(() => import('../dashboard/TaskManagerModal')),
      position: { x: 100, y: 100 },
      size: { width: 900, height: 700 },
      category: 'task',
      icon: '📋',
      minimumSize: { width: 600, height: 400 },
      defaultPosition: { x: 100, y: 100 },
      defaultSize: { width: 900, height: 700 },
      isMaximized: false
    }),
    
    openQuickCapture: () => modalManager.openModal({
      id: 'quick-capture',
      title: 'Quick Capture',
      component: React.lazy(() => import('../dashboard/ActionButtons')),
      position: { x: 200, y: 150 },
      size: { width: 500, height: 400 },
      category: 'task',
      icon: '💡',
      minimumSize: { width: 400, height: 300 },
      defaultPosition: { x: 200, y: 150 },
      defaultSize: { width: 500, height: 400 },
      isMaximized: false
    }),
    
    openAIAssistant: () => modalManager.openModal({
      id: 'ai-assistant',
      title: 'AI Assistant',
      component: React.lazy(() => import('../ai/AIAssistantModal')),
      position: { x: 300, y: 200 },
      size: { width: 700, height: 600 },
      category: 'ai',
      icon: '🤖',
      minimumSize: { width: 500, height: 400 },
      defaultPosition: { x: 300, y: 200 },
      defaultSize: { width: 700, height: 600 },
      isMaximized: false
    }),
    
    openSystemStatus: () => modalManager.openModal({
      id: 'system-status',
      title: 'System Status',
      component: React.lazy(() => import('../dashboard/SystemStatusModal')),
      position: { x: 150, y: 100 },
      size: { width: 800, height: 500 },
      category: 'system',
      icon: '⚡',
      minimumSize: { width: 600, height: 300 },
      defaultPosition: { x: 150, y: 100 },
      defaultSize: { width: 800, height: 500 },
      isMaximized: false
    }),
    
    openSettings: () => modalManager.openModal({
      id: 'settings',
      title: 'Settings',
      component: React.lazy(() => import('../settings/SettingsModal')),
      position: { x: 250, y: 150 },
      size: { width: 600, height: 500 },
      category: 'settings',
      icon: '⚙️',
      minimumSize: { width: 500, height: 400 },
      defaultPosition: { x: 250, y: 150 },
      defaultSize: { width: 600, height: 500 },
      isMaximized: false
    }),
    
    // State queries
    getOpenModals: () => modalManager.getModalsByState('open'),
    getMinimizedModals: () => modalManager.getModalsByState('minimized'),
    getClosedModals: () => modalManager.getModalsByState('closed'),
    
    // Modal management
    closeAllModals: () => {
      modalManager.modals.forEach(modal => {
        modalManager.closeModal(modal.id)
      })
    },
    
    minimizeAllModals: () => {
      modalManager.modals
        .filter(modal => modal.state === 'open')
        .forEach(modal => {
          modalManager.minimizeModal(modal.id)
        })
    },
    
    restoreAllModals: () => {
      modalManager.modals
        .filter(modal => modal.state === 'minimized')
        .forEach(modal => {
          modalManager.restoreModal(modal.id)
        })
    },
    
    // Workspace management
    arrangeModalsCascade: () => {
      const openModals = modalManager.getModalsByState('open')
      openModals.forEach((modal, index) => {
        const offset = index * 30
        modalManager.updateModalPosition(modal.id, {
          x: 100 + offset,
          y: 100 + offset
        })
      })
    },
    
    arrangeModalsTiled: () => {
      const openModals = modalManager.getModalsByState('open')
      const cols = Math.ceil(Math.sqrt(openModals.length))
      const modalWidth = Math.floor(window.innerWidth / cols) - 20
      const modalHeight = Math.floor((window.innerHeight - 100) / Math.ceil(openModals.length / cols)) - 20
      
      openModals.forEach((modal, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        
        modalManager.updateModalPosition(modal.id, {
          x: col * (modalWidth + 10) + 10,
          y: row * (modalHeight + 10) + 10
        })
        
        modalManager.updateModalSize(modal.id, {
          width: modalWidth,
          height: modalHeight
        })
      })
    }
  }
}