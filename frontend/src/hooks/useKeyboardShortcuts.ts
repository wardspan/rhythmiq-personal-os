import { useEffect } from 'react'
import React from 'react'
import { ModalManager } from './useModalManager'

interface KeyboardShortcutsConfig {
  modalManager: ModalManager
  enabled?: boolean
}

export function useKeyboardShortcuts({ modalManager, enabled = true }: KeyboardShortcutsConfig) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return
      }

      // Global modal shortcuts (Ctrl/Cmd + key)
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 't':
            e.preventDefault()
            modalManager.openModal({
              id: 'task-manager',
              title: 'Task Manager',
              component: React.lazy(() => import('../components/dashboard/TaskManagerModal')),
              position: { x: 100, y: 100 },
              size: { width: 900, height: 700 },
              category: 'task',
              icon: '📋',
              minimumSize: { width: 600, height: 400 },
              defaultPosition: { x: 100, y: 100 },
              defaultSize: { width: 900, height: 700 },
              isMaximized: false
            })
            break

          case 'i':
            e.preventDefault()
            modalManager.openModal({
              id: 'quick-capture',
              title: 'Quick Capture',
              component: React.lazy(() => import('../components/dashboard/ActionButtons')),
              position: { x: 200, y: 150 },
              size: { width: 500, height: 400 },
              category: 'task',
              icon: '💡',
              minimumSize: { width: 400, height: 300 },
              defaultPosition: { x: 200, y: 150 },
              defaultSize: { width: 500, height: 400 },
              isMaximized: false
            })
            break

          case 'j':
            e.preventDefault()
            modalManager.openModal({
              id: 'ai-assistant',
              title: 'AI Assistant',
              component: React.lazy(() => import('../components/ai/AIAssistantModal')),
              position: { x: 300, y: 200 },
              size: { width: 700, height: 600 },
              category: 'ai',
              icon: '🤖',
              minimumSize: { width: 500, height: 400 },
              defaultPosition: { x: 300, y: 200 },
              defaultSize: { width: 700, height: 600 },
              isMaximized: false
            })
            break

          case ',':
            e.preventDefault()
            modalManager.openModal({
              id: 'settings',
              title: 'Settings',
              component: React.lazy(() => import('../components/settings/SettingsModal')),
              position: { x: 250, y: 150 },
              size: { width: 600, height: 500 },
              category: 'settings',
              icon: '⚙️',
              minimumSize: { width: 500, height: 400 },
              defaultPosition: { x: 250, y: 150 },
              defaultSize: { width: 600, height: 500 },
              isMaximized: false
            })
            break

          case 's':
            if (e.shiftKey) {
              e.preventDefault()
              modalManager.openModal({
                id: 'system-status',
                title: 'System Status',
                component: React.lazy(() => import('../components/dashboard/SystemStatusModal')),
                position: { x: 150, y: 100 },
                size: { width: 800, height: 500 },
                category: 'system',
                icon: '⚡',
                minimumSize: { width: 600, height: 300 },
                defaultPosition: { x: 150, y: 100 },
                defaultSize: { width: 800, height: 500 },
                isMaximized: false
              })
            }
            break

          case 'w':
            e.preventDefault()
            // Close the top-most modal
            const openModals = modalManager.getModalsByState('open')
            if (openModals.length > 0) {
              const topModal = openModals.reduce((highest, modal) =>
                modal.zIndex > highest.zIndex ? modal : highest
              )
              modalManager.closeModal(topModal.id)
            }
            break

          case 'm':
            e.preventDefault()
            // Minimize all open modals
            const modalsToMinimize = modalManager.getModalsByState('open')
            modalsToMinimize.forEach(modal => modalManager.minimizeModal(modal.id))
            break

          case 'r':
            if (e.shiftKey) {
              e.preventDefault()
              // Restore all minimized modals
              const modalsToRestore = modalManager.getModalsByState('minimized')
              modalsToRestore.forEach(modal => modalManager.restoreModal(modal.id))
            }
            break

          case 'q':
            if (e.shiftKey) {
              e.preventDefault()
              // Close all modals
              modalManager.modals.forEach(modal => modalManager.closeModal(modal.id))
            }
            break
        }
      }

      // Alt shortcuts for window arrangement
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            e.preventDefault()
            // Arrange modals in cascade
            arrangeModalsCascade(modalManager)
            break

          case 'g':
            e.preventDefault()
            // Arrange modals in grid
            arrangeModalsGrid(modalManager)
            break

          case 't':
            e.preventDefault()
            // Tile modals
            arrangeModalsTiled(modalManager)
            break
        }
      }

      // Function keys
      switch (e.key) {
        case 'F1':
          e.preventDefault()
          // Show help/shortcuts modal
          showKeyboardShortcuts(modalManager)
          break

        case 'F11':
          e.preventDefault()
          // Toggle fullscreen for top modal
          const openModalList = modalManager.getModalsByState('open')
          if (openModalList.length > 0) {
            const topModal = openModalList.reduce((highest, modal) =>
              modal.zIndex > highest.zIndex ? modal : highest
            )
            modalManager.maximizeModal(topModal.id)
          }
          break

        case 'Escape':
          // Close the top-most modal
          const openEscapeModals = modalManager.getModalsByState('open')
          if (openEscapeModals.length > 0) {
            const topModal = openEscapeModals.reduce((highest, modal) =>
              modal.zIndex > highest.zIndex ? modal : highest
            )
            modalManager.closeModal(topModal.id)
          }
          break
      }

      // Tab navigation enhancement
      if (e.key === 'Tab' && e.ctrlKey) {
        e.preventDefault()
        cycleModalFocus(modalManager, !e.shiftKey)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [modalManager, enabled])
}

// Helper functions for modal arrangement
function arrangeModalsCascade(modalManager: ModalManager) {
  const openModals = modalManager.getModalsByState('open')
  openModals.forEach((modal, index) => {
    const offset = index * 30
    modalManager.updateModalPosition(modal.id, {
      x: 100 + offset,
      y: 100 + offset
    })
  })
}

function arrangeModalsGrid(modalManager: ModalManager) {
  const openModals = modalManager.getModalsByState('open')
  const cols = Math.ceil(Math.sqrt(openModals.length))
  const modalWidth = 400
  const modalHeight = 300
  
  openModals.forEach((modal, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    
    modalManager.updateModalPosition(modal.id, {
      x: col * (modalWidth + 20) + 50,
      y: row * (modalHeight + 20) + 50
    })
    
    modalManager.updateModalSize(modal.id, {
      width: modalWidth,
      height: modalHeight
    })
  })
}

function arrangeModalsTiled(modalManager: ModalManager) {
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

function cycleModalFocus(modalManager: ModalManager, forward: boolean) {
  const openModals = modalManager.getModalsByState('open')
  if (openModals.length === 0) return
  
  const sortedModals = openModals.sort((a, b) => a.zIndex - b.zIndex)
  const currentTopModal = sortedModals[sortedModals.length - 1]
  
  if (forward) {
    const nextIndex = sortedModals.findIndex(m => m.id === currentTopModal.id) + 1
    const nextModal = sortedModals[nextIndex % sortedModals.length]
    modalManager.bringToFront(nextModal.id)
  } else {
    const prevIndex = sortedModals.findIndex(m => m.id === currentTopModal.id) - 1
    const prevModal = sortedModals[prevIndex < 0 ? sortedModals.length - 1 : prevIndex]
    modalManager.bringToFront(prevModal.id)
  }
}

function showKeyboardShortcuts(modalManager: ModalManager) {
  modalManager.openModal({
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    component: React.lazy(() => import('../components/help/KeyboardShortcutsModal')),
    position: { x: 200, y: 100 },
    size: { width: 600, height: 500 },
    category: 'general',
    icon: '⌨️',
    minimumSize: { width: 500, height: 400 },
    defaultPosition: { x: 200, y: 100 },
    defaultSize: { width: 600, height: 500 },
    isMaximized: false
  })
}