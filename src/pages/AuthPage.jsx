import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } else {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setSuccess('Check your email for a confirmation link.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">🚒</div>

      <div className="auth-card">
        <h1>FRV Allowances</h1>
        <p className="auth-sub">
          {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div style={{ background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius)', padding: '10px 13px', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@frv.vic.gov.au"
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading
              ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              : mode === 'login' ? 'Sign in' : 'Create account'
            }
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.875rem' }}
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'center', maxWidth: 280 }}>
        Your data is private and only visible to you.
      </p>
    </div>
  )
}
