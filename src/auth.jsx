import { createContext, useContext, useState } from 'react'
import { getToken, getUser, saveSession, clearSession } from './api'

// Contexto de autenticación: token + usuario, persistidos en localStorage.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken())
  const [user, setUser] = useState(getUser())

  function login(nuevoToken, nuevoUser) {
    saveSession(nuevoToken, nuevoUser)
    setToken(nuevoToken)
    setUser(nuevoUser)
  }

  function logout() {
    clearSession()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
