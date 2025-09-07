// Tests para `src/lib/firebase.js`
// Aquí mockeamos las funciones de 'firebase/auth' para probar la lógica local
import * as firebaseLib from '../src/lib/firebase'

vi.mock('firebase/auth', () => {
  return {
    signInWithEmailAndPassword: vi.fn((auth, email, pass) => {
      if (email === 'ok@example.com') return Promise.resolve({ user: { email } })
      return Promise.reject(new Error('invalid-credentials'))
    }),
    createUserWithEmailAndPassword: vi.fn((auth, email, pass) => {
      if (email === 'new@example.com') return Promise.resolve({ user: { email } })
      return Promise.reject(new Error('create-failed'))
    }),
    signInWithPopup: vi.fn((auth, provider) => Promise.resolve({ user: { provider: provider.providerId || 'google' } })),
    GoogleAuthProvider: vi.fn(function () { this.setCustomParameters = () => {} }),
  }
})

vi.mock('../pages/api/firebase', () => ({ auth: {} }), { virtual: true })

describe('firebase lib (mocks)', () => {
  it('signIn success', async () => {
    const res = await firebaseLib.signIn({ email: 'ok@example.com', password: 'x' })
    expect(res).toHaveProperty('user')
  })

  it('signIn rejects on bad credentials', async () => {
    await expect(firebaseLib.signIn({ email: 'bad', password: 'x' })).rejects.toThrow('invalid-credentials')
  })

  it('signUp success', async () => {
    const res = await firebaseLib.signUp({ email: 'new@example.com', password: 'x' })
    expect(res).toHaveProperty('user')
  })

  it('signInWithGoogle returns provider result', async () => {
    const res = await firebaseLib.signInWithGoogle()
    expect(res).toHaveProperty('user')
  })
})
