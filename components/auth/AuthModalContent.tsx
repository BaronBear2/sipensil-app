'use client'

import { useState, useEffect } from 'react'
import LoginForm from './LoginForm'
import RegisterFormManager from './RegisterFormManager'
import VerificationSuccess from './VerificationSuccess'
import ForgotPasswordForm from './ForgotPasswordForm'

type AuthView = 'LOGIN' | 'REGISTER' | 'VERIFY_SUCCESS' | 'FORGOT_PASSWORD'

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
                onForgotPasswordClick={() => handleSwitch('FORGOT_PASSWORD')}
                onSuccess={() => { }} // Redirection is handled by LoginForm
            />
        )
    }

    if (view === 'REGISTER') {
        return (
            <RegisterFormManager
                onLoginClick={() => handleSwitch('LOGIN')}
                onSuccess={() => setView('VERIFY_SUCCESS')}
            />
        )
    }

    if (view === 'VERIFY_SUCCESS') {
        return (
            <VerificationSuccess onLoginClick={() => handleSwitch('LOGIN')} />
        )
    }

    if (view === 'FORGOT_PASSWORD') {
        return (
            <ForgotPasswordForm onBackClick={() => handleSwitch('LOGIN')} />
        )
    }

    return null
}
