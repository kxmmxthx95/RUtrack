import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/types"

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function saveUserProfile(
  uid: string,
  profile: UserProfile,
): Promise<void> {
  await setDoc(doc(db, "users", uid), profile, { merge: true })
}
