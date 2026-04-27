import { getFirebaseServices } from './firebase'

const PAGE_SIZE = 8

export async function saveTrade(uid, tradeData) {
  const { db, firestoreModule } = await getFirebaseServices()
  const {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    increment,
    serverTimestamp,
    setDoc,
  } = firestoreModule

  const tradesRef = collection(db, 'users', uid, 'trades')
  const docRef = await addDoc(tradesRef, {
    ...tradeData,
    createdAt: serverTimestamp(),
  })

  const userRef = doc(db, 'users', uid)
  const isWin = tradeData.result === 'Win'
  const isLoss = tradeData.result === 'Loss'
  const isBE = tradeData.result === 'BE'

  const userSnap = await getDoc(userRef)
  const current = userSnap.data() || {}
  const newTotal = (current.totalTrades || 0) + 1
  const newAvgRR =
    ((current.avgRR || 0) * (current.totalTrades || 0) + (tradeData.rr || 0)) / newTotal
  const newAvgRisk =
    ((current.avgRisk || 0) * (current.totalTrades || 0) + (tradeData.riskPercent || 0)) /
    newTotal

  await setDoc(
    userRef,
    {
      totalTrades: increment(1),
      winCount: isWin ? increment(1) : increment(0),
      lossCount: isLoss ? increment(1) : increment(0),
      beCount: isBE ? increment(1) : increment(0),
      totalProfit: increment(tradeData.pnl || 0),
      avgRR: parseFloat(newAvgRR.toFixed(3)),
      avgRisk: parseFloat(newAvgRisk.toFixed(3)),
      accountBalance: current.accountBalance || 10000,
      displayName: current.displayName || 'Trader',
      email: current.email || '',
      createdAt: current.createdAt || serverTimestamp(),
    },
    { merge: true },
  )

  const monthId = tradeData.date.slice(0, 7)
  const monthRef = doc(db, 'users', uid, 'stats', monthId)
  const monthSnap = await getDoc(monthRef)

  if (monthSnap.exists()) {
    await updateDoc(monthRef, {
      profit: increment(tradeData.pnl || 0),
      trades: increment(1),
      wins: isWin ? increment(1) : increment(0),
    })
  } else {
    await setDoc(monthRef, {
      profit: tradeData.pnl || 0,
      trades: 1,
      wins: isWin ? 1 : 0,
      month: monthId,
    })
  }

  return docRef.id
}

export async function deleteTrade(uid, tradeId, tradeData) {
  const { db, firestoreModule } = await getFirebaseServices()
  const { doc, deleteDoc, getDoc, increment, setDoc } = firestoreModule

  await deleteDoc(doc(db, 'users', uid, 'trades', tradeId))

  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  const current = userSnap.data() || {}
  const newTotal = Math.max((current.totalTrades || 1) - 1, 0)

  const isWin = tradeData.result === 'Win'
  const isLoss = tradeData.result === 'Loss'
  const isBE = tradeData.result === 'BE'

  let newAvgRR = 0
  let newAvgRisk = 0
  if (newTotal > 0) {
    newAvgRR =
      ((current.avgRR || 0) * (current.totalTrades || 0) - (tradeData.rr || 0)) / newTotal
    newAvgRisk =
      ((current.avgRisk || 0) * (current.totalTrades || 0) - (tradeData.riskPercent || 0)) /
      newTotal
  }

  await setDoc(
    userRef,
    {
      totalTrades: increment(-1),
      winCount: isWin ? increment(-1) : increment(0),
      lossCount: isLoss ? increment(-1) : increment(0),
      beCount: isBE ? increment(-1) : increment(0),
      totalProfit: increment(-(tradeData.pnl || 0)),
      avgRR: parseFloat(Math.max(newAvgRR, 0).toFixed(3)),
      avgRisk: parseFloat(Math.max(newAvgRisk, 0).toFixed(3)),
      accountBalance: current.accountBalance || 10000,
      displayName: current.displayName || 'Trader',
      email: current.email || '',
    },
    { merge: true },
  )
}

export async function getUserSummary(uid) {
  const { db, firestoreModule } = await getFirebaseServices()
  const { doc, getDoc } = firestoreModule
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function getTrades(uid, filters = {}, lastVisible = null) {
  const { db, firestoreModule } = await getFirebaseServices()
  const {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
  } = firestoreModule

  const tradesRef = collection(db, 'users', uid, 'trades')
  const constraints = [orderBy('date', 'desc'), limit(PAGE_SIZE)]

  if (filters.pair) constraints.unshift(where('pair', '==', filters.pair))
  if (filters.result) constraints.unshift(where('result', '==', filters.result))
  if (filters.strategy) constraints.unshift(where('strategy', '==', filters.strategy))
  if (lastVisible) constraints.push(startAfter(lastVisible))

  const snapshot = await getDocs(query(tradesRef, ...constraints))
  const trades = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null

  return {
    trades,
    lastDoc,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  }
}

export async function getAllTrades(uid) {
  const { db, firestoreModule } = await getFirebaseServices()
  const { collection, getDocs, query, orderBy, limit } = firestoreModule

  const allTradesQuery = query(
    collection(db, 'users', uid, 'trades'),
    orderBy('date', 'asc'),
    limit(500),
  )

  const snapshot = await getDocs(allTradesQuery)
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function getMonthlyStats(uid) {
  const { db, firestoreModule } = await getFirebaseServices()
  const { collection, getDocs } = firestoreModule
  const snapshot = await getDocs(collection(db, 'users', uid, 'stats'))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function uploadScreenshot(uid, tradeId, file) {
  const { storage, storageModule } = await getFirebaseServices()
  const { ref, uploadBytes, getDownloadURL } = storageModule

  const compressed = await compressImage(file, 800, 0.7)
  const storageRef = ref(storage, `users/${uid}/trades/${tradeId}.jpg`)
  await uploadBytes(storageRef, compressed)
  return getDownloadURL(storageRef)
}

async function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const image = new Image()

    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width)
      canvas.width = image.width * scale
      canvas.height = image.height * scale
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }

    image.src = URL.createObjectURL(file)
  })
}
