import React, { useState } from 'react'

interface SettingsModalProps {
  modalManager?: any
}

interface SettingsSection {
  id: string
  title: string
  icon: string
  settings: SettingItem[]
}

interface SettingItem {
  id: string
  label: string
  type: 'toggle' | 'select' | 'input' | 'slider'
  value: any
  options?: string[]
  description?: string
  min?: number
  max?: number
}

export default function SettingsModal({ modalManager }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState<SettingsSection[]>([
    {
      id: 'general',
      title: 'General',
      icon: '⚙️',
      settings: [
        {
          id: 'theme',
          label: 'Theme',
          type: 'select',
          value: 'light',
          options: ['light', 'dark', 'auto'],
          description: 'Choose your preferred color theme'
        },
        {
          id: 'notifications',
          label: 'Enable Notifications',
          type: 'toggle',
          value: true,
          description: 'Show system and task notifications'
        },
        {
          id: 'autoSave',
          label: 'Auto-save Interval',
          type: 'slider',
          value: 30,
          min: 5,
          max: 300,
          description: 'Automatically save changes every N seconds'
        }
      ]
    },
    {
      id: 'modals',
      title: 'Window Management',
      icon: '🪟',
      settings: [
        {
          id: 'snapToEdges',
          label: 'Snap to Edges',
          type: 'toggle',
          value: true,
          description: 'Automatically snap modals to screen edges'
        },
        {
          id: 'showSnapZones',
          label: 'Show Snap Zones',
          type: 'toggle',
          value: true,
          description: 'Display visual guides when dragging modals'
        },
        {
          id: 'animationSpeed',
          label: 'Animation Speed',
          type: 'select',
          value: 'normal',
          options: ['slow', 'normal', 'fast', 'none'],
          description: 'Control modal animation speed'
        },
        {
          id: 'rememberPositions',
          label: 'Remember Positions',
          type: 'toggle',
          value: true,
          description: 'Save modal positions and sizes between sessions'
        }
      ]
    },
    {
      id: 'productivity',
      title: 'Productivity',
      icon: '📈',
      settings: [
        {
          id: 'smartMode',
          label: 'SMART Task Validation',
          type: 'toggle',
          value: true,
          description: 'Enforce SMART criteria for new tasks'
        },
        {
          id: 'chaosThreshold',
          label: 'Chaos Detection Sensitivity',
          type: 'slider',
          value: 70,
          min: 0,
          max: 100,
          description: 'Sensitivity for detecting productivity chaos'
        },
        {
          id: 'mitLimit',
          label: 'Daily MIT Limit',
          type: 'slider',
          value: 3,
          min: 1,
          max: 10,
          description: 'Maximum Most Important Tasks per day'
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: '🔗',
      settings: [
        {
          id: 'whoopSync',
          label: 'WHOOP Sync Enabled',
          type: 'toggle',
          value: false,
          description: 'Sync health and fitness data from WHOOP'
        },
        {
          id: 'aiAssistant',
          label: 'AI Assistant',
          type: 'toggle',
          value: true,
          description: 'Enable AI-powered assistance and automation'
        },
        {
          id: 'weatherUpdates',
          label: 'Weather Updates',
          type: 'toggle',
          value: true,
          description: 'Show current weather information'
        }
      ]
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      icon: '♿',
      settings: [
        {
          id: 'largeText',
          label: 'Large Text',
          type: 'toggle',
          value: false,
          description: 'Increase text size for better readability'
        },
        {
          id: 'highContrast',
          label: 'High Contrast',
          type: 'toggle',
          value: false,
          description: 'Increase contrast for better visibility'
        },
        {
          id: 'keyboardShortcuts',
          label: 'Keyboard Shortcuts',
          type: 'toggle',
          value: true,
          description: 'Enable keyboard shortcuts for common actions'
        },
        {
          id: 'screenReader',
          label: 'Screen Reader Support',
          type: 'toggle',
          value: false,
          description: 'Optimize for screen reader compatibility'
        }
      ]
    }
  ])

  const updateSetting = (sectionId: string, settingId: string, newValue: any) => {
    setSettings(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            settings: section.settings.map(setting =>
              setting.id === settingId ? { ...setting, value: newValue } : setting
            )
          }
        : section
    ))
  }

  const activeSettings = settings.find(s => s.id === activeSection)?.settings || []

  const renderSettingControl = (setting: SettingItem, sectionId: string) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={setting.value}
              onChange={(e) => updateSetting(sectionId, setting.id, e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        )
      
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(sectionId, setting.id, e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        )
      
      case 'input':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(sectionId, setting.id, e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      
      case 'slider':
        return (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={setting.min || 0}
              max={setting.max || 100}
              value={setting.value}
              onChange={(e) => updateSetting(sectionId, setting.id, parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-sm font-medium text-slate-600 min-w-12">
              {setting.value}{setting.id === 'autoSave' ? 's' : setting.id.includes('Threshold') || setting.id.includes('Sensitivity') ? '%' : ''}
            </span>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 border-r border-slate-200 bg-slate-50">
        <div className="p-4">
          <h2 className="font-bold text-slate-800 mb-4">⚙️ Settings</h2>
          <nav className="space-y-1">
            {settings.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">{section.icon}</span>
                <span className="text-sm">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeSettings.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              {settings.find(s => s.id === activeSection)?.title} Settings
            </h3>

            <div className="space-y-6">
              {activeSettings.map(setting => (
                <div key={setting.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{setting.label}</div>
                    {setting.description && (
                      <div className="text-sm text-slate-500 mt-1">{setting.description}</div>
                    )}
                  </div>
                  <div className="ml-4">
                    {renderSettingControl(setting, activeSection)}
                  </div>
                </div>
              ))}
            </div>

            {/* Save Actions */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
                <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
                  Reset to Defaults
                </button>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Changes are automatically saved as you make them
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}