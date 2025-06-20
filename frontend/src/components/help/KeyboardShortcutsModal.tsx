import React from 'react'

interface KeyboardShortcutsModalProps {
  modalManager?: any
}

interface ShortcutGroup {
  title: string
  icon: string
  shortcuts: Array<{
    keys: string
    description: string
    category?: 'essential' | 'advanced'
  }>
}

export default function KeyboardShortcutsModal({ modalManager }: KeyboardShortcutsModalProps) {
  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Modal Management',
      icon: '🪟',
      shortcuts: [
        { keys: 'Ctrl+T', description: 'Open Task Manager', category: 'essential' },
        { keys: 'Ctrl+I', description: 'Open Quick Capture', category: 'essential' },
        { keys: 'Ctrl+J', description: 'Open AI Assistant', category: 'essential' },
        { keys: 'Ctrl+,', description: 'Open Settings', category: 'essential' },
        { keys: 'Ctrl+Shift+S', description: 'Open System Status' },
        { keys: 'Ctrl+W', description: 'Close current modal', category: 'essential' },
        { keys: 'Ctrl+M', description: 'Minimize all modals' },
        { keys: 'Ctrl+Shift+R', description: 'Restore all minimized' },
        { keys: 'Ctrl+Shift+Q', description: 'Close all modals' },
        { keys: 'Esc', description: 'Close top modal', category: 'essential' }
      ]
    },
    {
      title: 'Window Controls',
      icon: '🎛️',
      shortcuts: [
        { keys: 'Alt+M', description: 'Minimize modal' },
        { keys: 'Alt+X', description: 'Maximize modal' },
        { keys: 'Alt+R', description: 'Restore modal' },
        { keys: 'Alt+C', description: 'Close modal' },
        { keys: 'Alt+D', description: 'Reset to default position' },
        { keys: 'F11', description: 'Toggle fullscreen' },
        { keys: 'Ctrl+Tab', description: 'Cycle through modals' },
        { keys: 'Ctrl+Shift+Tab', description: 'Cycle backwards' }
      ]
    },
    {
      title: 'Window Arrangement',
      icon: '📐',
      shortcuts: [
        { keys: 'Alt+C', description: 'Cascade arrangement', category: 'advanced' },
        { keys: 'Alt+G', description: 'Grid arrangement', category: 'advanced' },
        { keys: 'Alt+T', description: 'Tile arrangement', category: 'advanced' }
      ]
    },
    {
      title: 'Navigation & Help',
      icon: '🧭',
      shortcuts: [
        { keys: 'F1', description: 'Show this help', category: 'essential' },
        { keys: 'Ctrl+/', description: 'Search modals' },
        { keys: 'Ctrl+K', description: 'Command palette' }
      ]
    }
  ]

  const getKeyDisplay = (keys: string) => {
    return keys.split('+').map((key, index) => (
      <React.Fragment key={key}>
        {index > 0 && <span className="text-slate-400 mx-1">+</span>}
        <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono bg-slate-100 border border-slate-300 rounded">
          {key}
        </kbd>
      </React.Fragment>
    ))
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">⌨️ Keyboard Shortcuts</h2>
        <p className="text-slate-600">
          Master these shortcuts to navigate Rhythmiq like a productivity ninja
        </p>
      </div>

      {/* Essential vs All Toggle */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span className="text-sm text-slate-600">Essential shortcuts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
          <span className="text-sm text-slate-600">Advanced shortcuts</span>
        </div>
      </div>

      {/* Shortcut Groups */}
      <div className="space-y-6">
        {shortcutGroups.map((group) => (
          <div key={group.title} className="border border-slate-200 rounded-lg p-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
              <span className="text-lg">{group.icon}</span>
              {group.title}
            </h3>
            
            <div className="space-y-3">
              {group.shortcuts.map((shortcut, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-2 rounded ${
                    shortcut.category === 'essential' ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {shortcut.category === 'essential' && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full" title="Essential shortcut" />
                    )}
                    <span className="text-slate-700">{shortcut.description}</span>
                  </div>
                  <div className="flex items-center">
                    {getKeyDisplay(shortcut.keys)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-medium text-amber-800 mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Use <kbd className="px-1 py-0.5 bg-amber-100 rounded">Ctrl+Tab</kbd> to quickly switch between open modals</li>
          <li>• Double-click modal title bars to reset position and size</li>
          <li>• Drag modals near screen edges to see snap zones</li>
          <li>• Right-click taskbar tabs for additional options</li>
          <li>• Hold <kbd className="px-1 py-0.5 bg-amber-100 rounded">Shift</kbd> while dragging to constrain movement</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 text-center">
        <div className="text-xs text-slate-500">
          Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded">F1</kbd> anytime to open this help
        </div>
      </div>
    </div>
  )
}