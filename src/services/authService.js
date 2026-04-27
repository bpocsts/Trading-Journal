import { getFirebaseServices } from './firebase'

export async function registerUser(email, password, displayName) {
  const { auth, db, authModule, firestoreModule } = await getFirebaseServices()
  const { createUserWithEmailAndPassword, updateProfile } = authModule

  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })

  await ensureUserProfileDoc(db, firestoreModule, cred.user.uid, {
    displayName,
    email,
  })

  return cred.user
}

export async function loginUser(email, password) {
  const { auth, db, authModule, firestoreModule } = await getFirebaseServices()
  const { signInWithEmailAndPassword } = authModule
  const cred = await signInWithEmailAndPassword(auth, email, password)
  await ensureUserProfileDoc(db, firestoreModule, cred.user.uid, {
    displayName: cred.user.displayName || email.split('@')[0],
    email: cred.user.email || email,
  })
  return cred.user
}

export async function logoutUser() {
  const { auth, authModule } = await getFirebaseServices()
  await authModule.signOut(auth)
}

export async function getUserProfile(uid) {
  const { db, firestoreModule } = await getFirebaseServices()
  const { doc, getDoc } = firestoreModule
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) {
    await ensureUserProfileDoc(db, firestoreModule, uid)
    const fallbackSnap = await getDoc(userRef)
    return fallbackSnap.exists() ? { id: fallbackSnap.id, ...fallbackSnap.data() } : null
  }

  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function onAuthChange(callback) {
  const { auth, authModule } = await getFirebaseServices()
  return authModule.onAuthStateChanged(auth, callback)
}

async function ensureUserProfileDoc(db, firestoreModule, uid, profile = {}) {
  const { doc, setDoc, serverTimestamp } = firestoreModule

  await setDoc(
    doc(db, 'users', uid),
    {
      displayName: profile.displayName || 'Trader',
      email: profile.email || '',
      totalTrades: 0,
      winCount: 0,
      lossCount: 0,
      beCount: 0,
      totalProfit: 0,
      avgRR: 0,
      avgRisk: 0,
      accountBalance: 10000,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )
}
