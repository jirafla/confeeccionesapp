'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Faltan campos por completar' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const dbUser = await prisma.usuario.findUnique({ where: { id: data.user.id } });
    if (!dbUser) {
      // Auto-sync user if they lost their DB record (e.g. after a force-reset)
      // Hardcode to the new Empresa for testing
      const empresa = await prisma.empresa.findFirst();
      if (empresa) {
        await prisma.usuario.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            empresaId: empresa.id,
            rol: "ADMIN"
          }
        });
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const empresaId = formData.get('empresaId') as string 
  const nuevaEmpresaNombre = formData.get('nuevaEmpresaNombre') as string

  if (!email || !password || (!empresaId && !nuevaEmpresaNombre)) {
    return { error: 'Faltan campos por completar' }
  }

  let empresa = null;

  if (empresaId) {
    empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) return { error: 'El ID de Invitación no existe' };
  } else {
    // Check if the user wants to create a new one
    empresa = await prisma.empresa.create({
      data: { nombre: nuevaEmpresaNombre }
    });
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }

  if (data.user) {
    await prisma.usuario.create({
      data: {
        id: data.user.id,
        email: data.user.email!,
        empresaId: empresa.id,
        rol: empresaId ? "EMPLEADO" : "ADMIN"
      }
    });
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
