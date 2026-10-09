import { createClient } from '@/utils/supabase/server'
import { prisma } from './prisma'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { empresa: true }
  })

  if (!dbUser) {
    // Edge case: user exists in Auth but not in DB
    await supabase.auth.signOut()
    redirect('/login')
  }

  return { user: dbUser, empresa: dbUser.empresa }
}
