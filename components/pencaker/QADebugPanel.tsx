'use client'

import { useState } from 'react'
import { qaUpdateProgressStep } from '@/actions/qa'
import { SwalToast } from '@/utils/swal'

export default function QADebugPanel({ regId, currentStep }: { regId: string, currentStep: number }) {
    const [loading, setLoading] = useState(false)

    const handleStepChange = async (step: number) => {
        if (loading) return
        setLoading(true)

        const formData = new FormData()
        formData.append('regId', regId)
        formData.append('step', step.toString())

        try {
            const res = await qaUpdateProgressStep(formData)
            if (res.error) {
                SwalToast.fire({ icon: 'error', title: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: `Jumped to Step ${step}` })
            }
        } catch (error) {
            SwalToast.fire({ icon: 'error', title: 'Error' })
        } finally {
            setLoading(false)
        }
    }

    // Only show in development mode (optional: you could check process.env.NODE_ENV)
    // But since this is explicitly requested as a QA feature, we'll show it.
    
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-3 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.2)] border-t border-gray-800 backdrop-blur-md bg-opacity-95 animate-fade-in-up">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    QA Mode: Time Jump
                </div>
                
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
                    {[
                        { label: 'Step 1', targetStep: 1, activeCondition: (s: number) => s === 1 },
                        { label: 'Step 2 & 3', targetStep: 2, activeCondition: (s: number) => s === 2 || s === 3 },
                        { label: 'Step 4, 5, 6', targetStep: 4, activeCondition: (s: number) => s >= 4 && s <= 6 },
                        { label: 'Step 7 & 8', targetStep: 7, activeCondition: (s: number) => s === 7 || s === 8 }
                    ].map((group) => (
                        <button
                            key={group.label}
                            onClick={() => handleStepChange(group.targetStep)}
                            disabled={loading || group.activeCondition(currentStep)}
                            className={`px-3 py-1.5 rounded text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                                group.activeCondition(currentStep)
                                    ? 'bg-blue-600 text-white shadow-inner scale-95 opacity-80' 
                                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white'
                            } disabled:opacity-50`}
                        >
                            {group.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
