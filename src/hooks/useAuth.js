import { useCallback, useEffect, useState } from 'react'
import { getUserProfile, onAuthChange } from '../services/authService'
import { isFirebaseConfigured } from '../services/firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [firebaseReady, setFirebaseReady] = useState(isFirebaseConfigured())

  const refreshProfile = useCallback(async (uid) => {
    if (!uid) {
      setProfile(null)
      return null
    }

    setProfileLoading(true)

    try {
      const nextProfile = await getUserProfile(uid)
      setProfile(nextProfile)
      return nextProfile
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let unsubscribe = () => {}

    async function connectAuth() {
      if (!isFirebaseConfigured()) {
        if (isMounted) {
          setFirebaseReady(false)
          setLoading(false)
        }
        return
      }

      try {
        unsubscribe = await onAuthChange(async (firebaseUser) => {
          if (!isMounted) return

          setFirebaseReady(true)
          setAuthError('')
          setLoading(false)

          if (firebaseUser) {
            setUser(firebaseUser)
            refreshProfile(firebaseUser.uid).catch((error) => {
              if (isMounted) {
                setAuthError(error.message)
              }
            })
          } else {
            setUser(null)
            setProfile(null)
          }
        })
      } catch (error) {
        if (isMounted) {
          setFirebaseReady(false)
          setAuthError(error.message)
          setLoading(false)
        }
      }
    }

    connectAuth()

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [refreshProfile])

  return { user, profile, loading, profileLoading, authError, firebaseReady, refreshProfile }
}
