import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FirebaseError } from "firebase/app"
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { auth } from "@/lib/firebase"

function authErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      case "auth/too-many-requests":
        return "พยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง"
      case "auth/popup-closed-by-user":
        return "หน้าต่างเข้าสู่ระบบถูกปิดก่อนเสร็จสมบูรณ์"
      case "auth/account-exists-with-different-credential":
        return "มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว"
      default:
        return err.message
    }
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signIn(email, password)
      const from = (location.state as { from?: { pathname: string } })?.from
      navigate(from?.pathname ?? "/", { replace: true })
    } catch (err) {
      toast.error(authErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setSubmitting(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      const from = (location.state as { from?: { pathname: string } })?.from
      navigate(from?.pathname ?? "/", { replace: true })
      toast.success("เข้าสู่ระบบด้วย Google สำเร็จ!")
    } catch (err) {
      toast.error(authErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGithubSignIn() {
    setSubmitting(true)
    const provider = new GithubAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      const from = (location.state as { from?: { pathname: string } })?.from
      navigate(from?.pathname ?? "/", { replace: true })
      toast.success("เข้าสู่ระบบด้วย GitHub สำเร็จ!")
    } catch (err) {
      toast.error(authErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error("กรุณากรอกอีเมลของคุณก่อน")
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบกล่องจดหมาย")
    } catch (err) {
      toast.error(authErrorMessage(err))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] px-4 py-12 dark:bg-[#0f172a]">
      <div className="w-full max-w-[440px] rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-800/80 dark:bg-[#1e293b] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] sm:p-10">
        
        {/* Shield Icon Container */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-800 dark:bg-[#1e293b]">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21.35l-7.35-7.35C3.5 12.85 3 11.5 3 10.15V5.5C3 4.12 4.12 3 5.5 3h13C19.88 3 21 4.12 21 5.5v4.65c0 1.35-.5 2.7-1.65 3.85l-7.35 7.35z"
              fill="url(#blueGradient)"
            />
            <path
              d="M12 7.5c0 2.2 1.3 3.5 3.5 3.5c-2.2 0-3.5 1.3-3.5 3.5c0-2.2-1.3-3.5-3.5-3.5c2.2 0 3.5-1.3 3.5-3.5z"
              fill="white"
            />
            <defs>
              <linearGradient id="blueGradient" x1="12" y1="3" x2="12" y2="21.35" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4A86F7" />
                <stop offset="100%" stopColor="#2B61E3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Header */}
        <h1 className="text-center text-[26px] font-bold tracking-tight text-slate-900 dark:text-white">
          ยินดีต้อนรับกลับ
        </h1>
        <p className="mt-1.5 text-center text-[15px] text-slate-500 dark:text-slate-400">
          เข้าสู่ระบบเพื่อดำเนินการต่อ
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              อีเมลหรือเบอร์โทรศัพท์
            </label>
            <input
              id="email"
              type="email"
              placeholder="กรอกอีเมลหรือเบอร์โทรศัพท์ของคุณ"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
            />
          </div>

          {/* Password field */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                รหัสผ่าน
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 pl-4 pr-16 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-sm font-medium text-slate-400 hover:text-slate-600 focus:outline-none dark:text-slate-500 dark:hover:text-slate-300"
              >
                {showPassword ? "ซ่อน" : "แสดง"}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#4A86F7] to-[#2B61E3] text-sm font-medium text-white shadow-md shadow-blue-500/10 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/15 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 dark:bg-[#1e293b] dark:text-slate-500">
              หรือดำเนินการต่อด้วย
            </span>
          </div>
        </div>

        {/* Social login buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800/50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={submitting}
            className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800/50"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-900 dark:text-white"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.449 22 12.017 22 6.484 17.522 2 12 2z"
              />
            </svg>
            GitHub
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          ยังไม่มีบัญชี?
          <Link
            to="/register"
            className="ml-1.5 font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            สมัครสมาชิก
          </Link>
        </p>

      </div>
    </div>
  )
}
