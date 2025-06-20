import React, { useState, useRef, useEffect } from 'react'
import { ModalManager, ModalState } from '../../hooks/useModalManager'

interface ModalTaskbarProps {
  modalManager: ModalManager
}

interface ContextMenuProps {
  modal: ModalState
  position: { x: number; y: number }
  onClose: () => void
  modalManager: ModalManager
}

function ContextMenu({ modal, position, onClose, modalManager }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const menuItems = [
    {
      label: 'Restore',
      icon: '📖',
      action: () => {
        modalManager.restoreModal(modal.id)
        onClose()
      }
    },
    {
      label: 'Maximize',
      icon: '⛶',
      action: () => {
        modalManager.restoreModal(modal.id)
        setTimeout(() => modalManager.maximizeModal(modal.id), 100)
        onClose()
      }
    },
    {
      label: 'Reset Position',
      icon: '↺',
      action: () => {
        modalManager.resetModalToDefault(modal.id)
        onClose()
      }
    },
    {
      label: 'Close',
      icon: '✕',
      action: () => {
        modalManager.closeModal(modal.id)
        onClose()
      },
      destructive: true
    }
  ]

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-slate-300 rounded-lg shadow-xl py-1 z-50 min-w-32"
      style={{
        left: position.x,
        top: position.y - 120, // Position above the taskbar
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-left ${
            item.destructive ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'
          }`}
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default function ModalTaskbar({ modalManager }: ModalTaskbarProps) {
  const [contextMenu, setContextMenu] = useState<{
    modal: ModalState
    position: { x: number; y: number }
  } | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const minimizedModals = modalManager.getModalsByState('minimized')

  if (minimizedModals.length === 0) {
    return null
  }

  const handleTabClick = (modal: ModalState) => {
    modalManager.restoreModal(modal.id)
  }

  const handleTabRightClick = (e: React.MouseEvent, modal: ModalState) => {
    e.preventDefault()
    setContextMenu({
      modal,
      position: { x: e.clientX, y: e.clientY }
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  // Handle drag and drop for tab reordering
  const handleDragStart = (e: React.DragEvent, modal: ModalState) => {
    e.dataTransfer.setData('text/plain', modal.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, targetModalId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(targetModalId)
  }

  const handleDragLeave = () => {
    setDragOver(null)
  }

  const handleDrop = (e: React.DragEvent, targetModalId: string) => {
    e.preventDefault()
    const sourceModalId = e.dataTransfer.getData('text/plain')
    setDragOver(null)
    
    // Note: Tab reordering would require additional state management
    // For now, we'll just provide visual feedback
    console.log('Reorder tabs:', sourceModalId, 'to position of', targetModalId)
  }

  return (
    <>
      {/* Taskbar */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white border border-slate-300 rounded-t-xl shadow-2xl z-30 px-2 py-2">
        <div className="flex items-center gap-1">
          {/* Taskbar indicator */}
          <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-500 border-r border-slate-200 mr-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            {minimizedModals.length} minimized
          </div>

          {/* Minimized modal tabs */}
          {minimizedModals.map((modal) => (
            <div
              key={modal.id}
              className={`relative group ${
                dragOver === modal.id ? 'bg-blue-100 border-blue-300' : ''
              }`}
            >
              <button
                onClick={() => handleTabClick(modal)}
                onContextMenu={(e) => handleTabRightClick(e, modal)}
                draggable
                onDragStart={(e) => handleDragStart(e, modal)}
                onDragOver={(e) => handleDragOver(e, modal.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, modal.id)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all hover:shadow-md group-hover:scale-105 cursor-pointer"
                title={`${modal.title} - Click to restore, Right-click for options`}
                aria-label={`Restore ${modal.title} modal`}
              >
                {/* Icon */}
                <span className="text-base">{modal.icon}</span>
                
                {/* Title */}
                <span className="text-sm font-medium text-slate-700 max-w-20 truncate">
                  {modal.title}
                </span>
                
                {/* Category indicator */}
                <div className={`w-2 h-2 rounded-full ${
                  modal.category === 'task' ? 'bg-blue-400' :
                  modal.category === 'ai' ? 'bg-purple-400' :
                  modal.category === 'system' ? 'bg-green-400' :
                  modal.category === 'settings' ? 'bg-gray-400' :
                  'bg-orange-400'
                }`} />

                {/* Close button (appears on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    modalManager.closeModal(modal.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center bg-slate-200 hover:bg-red-200 rounded text-xs transition-all"
                  title="Close"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </button>
              
              {/* Drag indicator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-slate-300 rounded-b opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}

          {/* Taskbar controls */}
          <div className="flex items-center gap-1 pl-2 ml-2 border-l border-slate-200">
            {/* Restore all */}
            <button
              onClick={() => {
                minimizedModals.forEach(modal => modalManager.restoreModal(modal.id))
              }}
              className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
              title="Restore all minimized modals"
              aria-label="Restore all minimized modals"
            >
              📖 All
            </button>
            
            {/* Close all */}
            <button
              onClick={() => {
                minimizedModals.forEach(modal => modalManager.closeModal(modal.id))
              }}
              className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded transition-colors"
              title="Close all minimized modals"
              aria-label="Close all minimized modals"
            >
              ✕ All
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-xs text-slate-400 text-center mt-1 px-2">
          💡 Right-click tabs for options • Drag to reorder
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          modal={contextMenu.modal}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
          modalManager={modalManager}
        />
      )}
    </>
  )
}