import React from 'react'

export default function HealthWidgetSimple() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="text-3xl mb-3">💓</div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Connect WHOOP</h3>
        <p className="text-sm text-slate-500 mb-4">
          Connect your WHOOP device to track recovery, sleep, and strain data.
        </p>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Connect WHOOP
        </button>
        
        <div className="mt-4 text-xs text-slate-400">
          <div className="mb-2">Benefits of connecting WHOOP:</div>
          <ul className="text-left space-y-1 max-w-xs mx-auto">
            <li>• Recovery-based task scheduling</li>
            <li>• Sleep quality impact on focus</li>
            <li>• ADHD symptom correlation tracking</li>
            <li>• Personalized productivity insights</li>
          </ul>
        </div>
      </div>
    </div>
  )
}