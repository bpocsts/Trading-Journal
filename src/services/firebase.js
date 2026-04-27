const firebaseConfig = {
  apiKey: 'AIzaSyBBpiFtDatC6QwHLUKCDG_WzwjpyES1Cyo',
  authDomain: 'trading-journal-503d1.firebaseapp.com',
  projectId: 'trading-journal-503d1',
  storageBucket: 'trading-journal-503d1.firebasestorage.app',
  messagingSenderId: '571904252330',
  appId: '1:571904252330:web:f6f2a8952e2cadec44b3d3',
}

const REQUIRED_KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]

let cachedServicesPromise = null

export function isFirebaseConfigured() {
  return REQUIRED_KEYS.every((key) => {
    const value = firebaseConfig[key]
    return typeof value === 'string' && value.trim() !== '' && !value.startsWith('YOUR_')
  })
}

export async function getFirebaseServices() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase config is missing in src/services/firebase.js.')
  }

  if (!cachedServicesPromise) {
    cachedServicesPromise = (async () => {
      try {
        const [
          appModule,
          authModule,
          firestoreModule,
          storageModule,
        ] = await Promise.all([
          import(/* @vite-ignore */ 'firebase/app'),
          import(/* @vite-ignore */ 'firebase/auth'),
          import(/* @vite-ignore */ 'firebase/firestore'),
          import(/* @vite-ignore */ 'firebase/storage'),
        ])

        const app = appModule.initializeApp(firebaseConfig)

        return {
          app,
          auth: authModule.getAuth(app),
          db: firestoreModule.getFirestore(app),
          storage: storageModule.getStorage(app),
          authModule,
          firestoreModule,
          storageModule,
        }
      } catch (error) {
        throw new Error(
          `Firebase package is not available. Install it with "npm install firebase". ${error.message}`,
          { cause: error },
        )
      }
    })()
  }

  return cachedServicesPromise
}
