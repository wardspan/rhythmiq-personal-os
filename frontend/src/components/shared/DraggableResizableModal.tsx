import React, { useState, useRef, useEffect, useCallback } from 'react'
import Draggable from 'react-draggable'
import { ResizableBox } from 'react-resizable'
import { ModalState, ModalManager } from '../../hooks/useModalManager'
import 'react-resizable/css/styles.css'

interface DraggableResizableModalProps {
  modal: ModalState
  modalManager: ModalManager
  children: React.ReactNode
}

interface WindowControlsProps {
  modal: ModalState
  modalManager: ModalManager
  onDoubleClick: () => void
}

function WindowControls({ modal, modalManager, onDoubleClick }: WindowControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Minimize */}
      <button
        onClick={() => modalManager.minimizeModal(modal.id)}
        className="w-3 h-3 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
        title="Minimize (Alt+M)"
        aria-label="Minimize modal"
      />
      
      {/* Maximize/Restore */}
      <button
        onClick={() => modalManager.maximizeModal(modal.id)}
        className="w-3 h-3 bg-green-400 hover:bg-green-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
        title={modal.isMaximized ? "Restore (Alt+R)" : "Maximize (Alt+X)"}
        aria-label={modal.isMaximized ? "Restore modal" : "Maximize modal"}
      />
      
      {/* Close */}
      <button
        onClick={() => modalManager.closeModal(modal.id)}
        className="w-3 h-3 bg-red-400 hover:bg-red-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
        title="Close (Alt+C)"
        aria-label="Close modal"
      />
      
      {/* Reset Position/Size */}
      <button
        onClick={onDoubleClick}
        className="ml-2 px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
        title="Reset to default (Alt+D)"
        aria-label="Reset modal to default position and size"
      >
        ↺
      </button>
    </div>
  )
}

export default function DraggableResizableModal({ modal, modalManager, children }: DraggableResizableModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [showSnapZones, setShowSnapZones] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Don't render if modal is not open
  if (modal.state !== 'open') {
    return null
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return

      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault()
          modalManager.minimizeModal(modal.id)
          break
        case 'x':
          e.preventDefault()
          modalManager.maximizeModal(modal.id)
          break
        case 'r':
          e.preventDefault()
          if (modal.isMaximized) {
            modalManager.maximizeModal(modal.id) // Toggle off
          }
          break
        case 'c':
          e.preventDefault()
          modalManager.closeModal(modal.id)
          break
        case 'd':
          e.preventDefault()
          modalManager.resetModalToDefault(modal.id)
          break
      }
    }

    // Only listen when this modal is focused
    const modalElement = modalRef.current
    if (modalElement) {
      modalElement.addEventListener('keydown', handleKeyDown)
      return () => modalElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [modal, modalManager])

  // Handle drag events
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    setShowSnapZones(true)
    modalManager.bringToFront(modal.id)
  }, [modal.id, modalManager])

  const handleDragStop = useCallback((e: any, data: any) => {
    setIsDragging(false)
    setShowSnapZones(false)
    modalManager.updateModalPosition(modal.id, { x: data.x, y: data.y })
  }, [modal.id, modalManager])

  // Handle resize events
  const handleResizeStart = useCallback(() => {
    setIsResizing(true)
    modalManager.bringToFront(modal.id)
  }, [modal.id, modalManager])

  const handleResizeStop = useCallback((e: any, { size }: any) => {
    setIsResizing(false)
    modalManager.updateModalSize(modal.id, { width: size.width, height: size.height })
  }, [modal.id, modalManager])

  // Handle double-click to reset
  const handleHeaderDoubleClick = useCallback(() => {
    modalManager.resetModalToDefault(modal.id)
  }, [modal.id, modalManager])

  // Handle click to bring to front
  const handleModalClick = useCallback(() => {
    modalManager.bringToFront(modal.id)
  }, [modal.id, modalManager])

  // Get snap zone indicators
  const getSnapZones = () => {
    if (!showSnapZones) return null

    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        {/* Left snap zone */}
        <div className="absolute left-0 top-0 w-20 h-full bg-blue-200 opacity-30 border-r-2 border-blue-400" />
        
        {/* Right snap zone */}
        <div className="absolute right-0 top-0 w-20 h-full bg-blue-200 opacity-30 border-l-2 border-blue-400" />
        
        {/* Top snap zone */}
        <div className="absolute top-0 left-0 w-full h-20 bg-blue-200 opacity-30 border-b-2 border-blue-400" />
        
        {/* Center guidelines */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-400 opacity-50" />
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-blue-400 opacity-50" />
      </div>
    )
  }

  const modalStyle = {
    zIndex: modal.zIndex,
    position: 'fixed' as const,
    left: modal.position.x,
    top: modal.position.y,
    transform: 'none'
  }

  return (
    <>
      {getSnapZones()}
      
      <div
        ref={modalRef}
        style={modalStyle}
        onClick={handleModalClick}
        className={`focus:outline-none ${isDragging || isResizing ? 'select-none' : ''}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${modal.id}`}
        onContextMenu={(e) => {
          e.preventDefault()
          // Could show context menu here
        }}
      >
        {modal.isMaximized ? (
          // Maximized mode - no drag/resize
          <div
            className="bg-white rounded-none shadow-2xl border border-slate-300 overflow-hidden"
            style={{
              width: modal.size.width,
              height: modal.size.height
            }}
          >
            {/* Title Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
              <div className="flex items-center gap-3">
                <span className="text-lg">{modal.icon}</span>
                <h3 
                  id={`modal-title-${modal.id}`}
                  className="font-medium text-slate-800 select-none"
                >
                  {modal.title}
                </h3>
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                  Maximized
                </span>
              </div>
              <WindowControls 
                modal={modal} 
                modalManager={modalManager} 
                onDoubleClick={handleHeaderDoubleClick}
              />
            </div>

            {/* Content */}
            <div className="h-full overflow-auto">
              {children}
            </div>
          </div>
        ) : (
          // Normal mode - draggable and resizable
          <Draggable
            handle=".modal-drag-handle"
            position={{ x: 0, y: 0 }}
            onStart={handleDragStart}
            onStop={handleDragStop}
            nodeRef={dragRef}
          >
            <div ref={dragRef}>
              <ResizableBox
                width={modal.size.width}
                height={modal.size.height}
                minConstraints={[
                  modal.minimumSize?.width || 300,
                  modal.minimumSize?.height || 200
                ]}
                maxConstraints={[
                  modal.maximumSize?.width || window.innerWidth,
                  modal.maximumSize?.height || window.innerHeight - 80
                ]}
                onResizeStart={handleResizeStart}
                onResizeStop={handleResizeStop}
                resizeHandles={['se', 'e', 's', 'sw', 'w', 'ne', 'n', 'nw']}
                className={`bg-white rounded-xl shadow-2xl border-2 border-slate-300 overflow-hidden transition-all duration-200 ${
                  isDragging ? 'rotate-1 scale-105 shadow-3xl' : ''
                } ${isResizing ? 'shadow-3xl' : ''}`}
              >
                <div className="h-full flex flex-col">
                  {/* Title Bar */}
                  <div 
                    className="modal-drag-handle flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 cursor-move hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 transition-colors"
                    onDoubleClick={handleHeaderDoubleClick}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{modal.icon}</span>
                      <h3 
                        id={`modal-title-${modal.id}`}
                        className="font-medium text-slate-800 select-none"
                      >
                        {modal.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        modal.category === 'task' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        modal.category === 'ai' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        modal.category === 'system' ? 'bg-green-100 text-green-800 border-green-200' :
                        modal.category === 'settings' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                        'bg-orange-100 text-orange-800 border-orange-200'
                      }`}>
                        {modal.category}
                      </span>
                    </div>
                    
                    <WindowControls 
                      modal={modal} 
                      modalManager={modalManager} 
                      onDoubleClick={handleHeaderDoubleClick}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-auto">
                    {children}
                  </div>
                  
                  {/* Resize indicator */}
                  {isResizing && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none">
                      {modal.size.width} × {modal.size.height}
                    </div>
                  )}
                </div>
              </ResizableBox>
            </div>
          </Draggable>
        )}
      </div>
    </>
  )
}