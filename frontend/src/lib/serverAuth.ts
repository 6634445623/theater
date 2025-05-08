import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value || null
}

export async function requireAuth() {
  const cookieStore = await cookies()
  const hasAuth = cookieStore.has('token')
  if (!hasAuth) {
    redirect('/auth/login')
  }
}

export async function clearServerToken() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}