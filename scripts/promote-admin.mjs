#!/usr/bin/env node
/**
 * promote-admin.mjs
 * ──────────────────
 * Set is_admin: true on a Firestore user document.
 *
 * Usage (by UID):
 *   node scripts/promote-admin.mjs --uid <firebase-uid>
 *
 * Usage (by student_id):
 *   node scripts/promote-admin.mjs --student_id <student_id>
 */

import { initializeApp } from "firebase/app"
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  getDoc,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBOUEI1eX8DItVsZvmKRQHLCplINIRFPhQ",
  authDomain: "ru-track-planner.firebaseapp.com",
  projectId: "ru-track-planner",
  storageBucket: "ru-track-planner.firebasestorage.app",
  messagingSenderId: "724996046205",
  appId: "1:724996046205:web:ac2da5c693f0911fbae014",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function promoteByUid(uid) {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    console.error(`❌  ไม่พบ user UID: ${uid}`)
    process.exit(1)
  }
  const data = snap.data()
  console.log(`📋  พบ user: ${data.first_name ?? ""} ${data.last_name ?? ""} (${data.student_id ?? uid})`)
  await updateDoc(ref, { is_admin: true })
  console.log(`✅  Set is_admin: true สำเร็จ!`)
}

async function promoteByStudentId(studentId) {
  const q = query(collection(db, "users"), where("student_id", "==", studentId))
  const snap = await getDocs(q)
  if (snap.empty) {
    console.error(`❌  ไม่พบ user ที่มี student_id: ${studentId}`)
    process.exit(1)
  }
  for (const d of snap.docs) {
    const data = d.data()
    console.log(`📋  พบ user: ${data.first_name ?? ""} ${data.last_name ?? ""} (UID: ${d.id})`)
    await updateDoc(d.ref, { is_admin: true })
    console.log(`✅  Set is_admin: true สำเร็จ! (UID: ${d.id})`)
  }
}

const args = process.argv.slice(2)
const uidIdx = args.indexOf("--uid")
const sidIdx = args.indexOf("--student_id")

if (uidIdx !== -1 && args[uidIdx + 1]) {
  await promoteByUid(args[uidIdx + 1])
} else if (sidIdx !== -1 && args[sidIdx + 1]) {
  await promoteByStudentId(args[sidIdx + 1])
} else {
  console.log(`
ใช้งาน:
  node scripts/promote-admin.mjs --uid <firebase-uid>
  node scripts/promote-admin.mjs --student_id <student_id>
`)
  process.exit(1)
}

process.exit(0)
