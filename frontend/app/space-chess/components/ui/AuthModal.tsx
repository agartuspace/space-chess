'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../stores/game-store'
import { apiUrl } from '@/lib/api-url'
import { persistAccessToken } from '@/lib/auth-token'

type ApiErrorPayload = {
  detail?: string | unknown
}

function formatApiError(payload: ApiErrorPayload, fallback: string): string {
  const { detail } = payload
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const first = detail[0] as Record<string, unknown> | undefined
    const msg = first?.msg
    return typeof msg === 'string' ? msg : fallback
  }
  return fallback
}

type Tab = 'login' | 'register' | 'guest'

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 14, 26, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
      }}
    />
  )
}

function FormInput({
  type,
  placeholder,
  value,
  onChange,
}: {
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(124, 58, 237, 0.25)',
        color: '#f8fafc',
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
      }}
    />
  )
}

function SubmitButton({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: 10,
        background: loading
          ? 'rgba(124, 58, 237, 0.3)'
          : 'linear-gradient(135deg, #7c3aed, #2563eb)',
        border: 'none',
        color: '#f8fafc',
        fontSize: 15,
        fontWeight: 600,
        cursor: loading ? 'default' : 'pointer',
        fontFamily: "'Space Grotesk', sans-serif",
        marginTop: 8,
        transition: 'opacity 0.2s',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Загрузка...' : children}
    </button>
  )
}

function LoginTab() {
  const { setUser, setAuthModalOpen } = useGameStore((s) => ({
    setUser: s.setUser,
    setAuthModalOpen: s.setAuthModalOpen,
  }))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(apiUrl('/api/v1/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as ApiErrorPayload & { access_token?: string; user_id?: string }

      if (!res.ok) {
        throw new Error(formatApiError(data, 'Ошибка входа'))
      }

      if (typeof data.access_token === 'string') {
        persistAccessToken(data.access_token)
      }

      if (!data.user_id) {
        throw new Error('Сервер не вернул идентификатор профиля')
      }

      setUser(data.user_id, null, false)
      setAuthModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FormInput type="email" placeholder="Email" value={email} onChange={setEmail} />
      <FormInput type="password" placeholder="Пароль" value={password} onChange={setPassword} />
      {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
      <SubmitButton loading={loading}>Войти</SubmitButton>
    </form>
  )
}

function RegisterTab() {
  const { setUser, setAuthModalOpen } = useGameStore((s) => ({
    setUser: s.setUser,
    setAuthModalOpen: s.setAuthModalOpen,
  }))
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const guestCookie = useGameStore.getState().guestId

      let url = apiUrl('/api/v1/auth/register')
      if (guestCookie) {
        const qs = new URLSearchParams({ guest_id: guestCookie })
        url = `${url}?${qs.toString()}`
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      })
      const data = (await res.json()) as ApiErrorPayload & { access_token?: string; user_id?: string }

      if (!res.ok) {
        throw new Error(formatApiError(data, 'Ошибка регистрации'))
      }

      if (typeof data.access_token === 'string') {
        persistAccessToken(data.access_token)
      }

      if (!data.user_id) {
        throw new Error('Сервер не вернул идентификатор профиля')
      }

      setUser(data.user_id, null, false)
      setAuthModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FormInput type="text" placeholder="Имя пользователя" value={username} onChange={setUsername} />
      <FormInput type="email" placeholder="Email" value={email} onChange={setEmail} />
      <FormInput type="password" placeholder="Пароль" value={password} onChange={setPassword} />
      {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
      <SubmitButton loading={loading}>Создать аккаунт</SubmitButton>
    </form>
  )
}

function GuestTab() {
  const { setUser, setAuthModalOpen } = useGameStore((s) => ({
    setUser: s.setUser,
    setAuthModalOpen: s.setAuthModalOpen,
  }))
  const [loading, setLoading] = useState(false)

  const handleGuest = async () => {
    setLoading(true)
    try {
      const guestId = crypto.randomUUID()
      const res = await fetch(apiUrl('/api/v1/auth/guest'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: guestId }),
      })

      const data = (await res.json()) as ApiErrorPayload & {
        access_token?: string
        user_id?: string
      }

      if (!res.ok) {
        throw new Error(formatApiError(data, 'Не удалось создать гостевую сессию'))
      }

      if (typeof data.access_token === 'string') {
        persistAccessToken(data.access_token)
      }

      if (!data.user_id) {
        throw new Error('Сервер не вернул идентификатор гостя')
      }

      setUser(data.user_id, guestId, true)
      setAuthModalOpen(false)
    } catch {
      persistAccessToken(null)
      const fallbackGuest = crypto.randomUUID()
      setUser(null, fallbackGuest, true)
      setAuthModalOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
        Играйте без регистрации. Прогресс сохраняется только в этом браузере.
      </p>
      <button
        onClick={handleGuest}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 10,
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          color: '#06b6d4',
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? 'default' : 'pointer',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {loading ? 'Загрузка...' : 'Играть без регистрации'}
      </button>
    </div>
  )
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'login', label: 'Войти' },
  { id: 'register', label: 'Регистрация' },
  { id: 'guest', label: 'Гость' },
]

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen } = useGameStore((s) => ({
    authModalOpen: s.authModalOpen,
    setAuthModalOpen: s.setAuthModalOpen,
  }))
  const [activeTab, setActiveTab] = useState<Tab>('login')

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          <Overlay onClick={() => setAuthModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 101,
              width: '90%',
              maxWidth: 400,
              background: 'rgba(13, 20, 36, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              borderRadius: 20,
              padding: '28px 28px 32px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#f8fafc',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Добро пожаловать
              </h2>
              <button
                onClick={() => setAuthModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeTab === tab.id ? 'rgba(124, 58, 237, 0.25)' : 'transparent',
                    color: activeTab === tab.id ? '#f8fafc' : '#94a3b8',
                    fontSize: 13,
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'login' && <LoginTab />}
                {activeTab === 'register' && <RegisterTab />}
                {activeTab === 'guest' && <GuestTab />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
