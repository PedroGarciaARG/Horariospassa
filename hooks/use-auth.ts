"use client"

import { useState, useEffect } from "react"

const PASSWORD = "Passabanfield"
const STORAGE_KEY = "eest6_auth"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setIsAuthenticated(stored === "true")
    setIsLoading(false)
  }, [])

  function login(password: string): boolean {
    if (password === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true")
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setIsAuthenticated(false)
  }

  return { isAuthenticated, isLoading, login, logout }
}
