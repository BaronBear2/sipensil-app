'use client'

import { useState, useEffect } from 'react'
import LoginForm from './LoginForm'
import RegisterFormManager from './RegisterFormManager'
import VerificationSuccess from './VerificationSuccess'

type AuthView = 'LOGIN' | 'REGISTER' | 'VERIFY_SUCCESS'

interface AuthModalProps {
    initialView: AuthView
    onSwitch: (view: AuthView) => void
    onClose: () => void
}

export default function AuthModalContent({ initialView, onSwitch, onClose }: AuthModalProps) {
    const [view, setView] = useState<AuthView>(initialView)

    // Sync when modal is re-opened with a specific view preference
    useEffect(() => {
        setView(initialView)
    }, [initialView])

    const handleSwitch = (newView: AuthView) => {
        setView(newView)
        onSwitch(newView)
    }

    if (view === 'LOGIN') {
        return (
            <LoginForm
                onRegisterClick={() => handleSwitch('REGISTER')}
                onSuccess={() => { }} // Redirection is handled by LoginForm
            />
        )
    }

    if (view === 'REGISTER') {
        return (
            <RegisterFormManager
                onLoginClick={() => handleSwitch('LOGIN')}
                onSuccess={() => setView('VERIFY_SUCCESS')} // Don't notify parent for this internal state, or do? Parent ignores it anyway.
            />
        )
    }

    if (view === 'VERIFY_SUCCESS') {
        return (
            <VerificationSuccess onLoginClick={() => handleSwitch('LOGIN')} />
        )
    }

    return null
}
