import { useState, type FormEvent } from 'react'
import { Airplane } from '@phosphor-icons/react'
import { isDemo, supabase } from '../lib/supabase'
import { Button, Field, Input } from '../components/ui'

export function Login() {
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)

    const { error } =
      mode === 'sign_in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else if (mode === 'sign_up') {
      setNotice('Account created. Check your inbox to confirm, then sign in.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4" style={{ background: 'var(--surface)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px]" style={{ background: 'var(--accent)' }}>
            <Airplane size={22} weight="fill" color="white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight">Skyline CRM</h1>
            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              {isDemo ? 'Demo mode · any email and password will do' : 'Staff access only'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email">
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@airline.com"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </Field>

          {error && (
            <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}
          {notice && (
            <p className="text-[13px]" style={{ color: 'var(--success)' }}>
              {notice}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Please wait…' : mode === 'sign_in' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <button
          className="mt-5 w-full text-center text-[13px]"
          style={{ color: 'var(--text-secondary)' }}
          onClick={() => {
            setMode((m) => (m === 'sign_in' ? 'sign_up' : 'sign_in'))
            setError(null)
            setNotice(null)
          }}
        >
          {mode === 'sign_in' ? "No account yet? Create one" : 'Already have an account? Sign in'}
        </button>

        {mode === 'sign_up' && (
          <p className="mt-3 text-center text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            Creating an account does not grant CRM access by itself. An admin must add your email to the staff list before you can view or edit records.
          </p>
        )}
      </div>
    </div>
  )
}
