'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

function checkConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const dbUrl = process.env.DATABASE_URL

  if (!supabaseUrl || !supabaseKey) {
    return 'Faltan variables NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel. Configúralas en Project Settings > Environment Variables.'
  }
  if (!dbUrl) {
    return 'Falta la variable DATABASE_URL en Vercel. Configúrala en Project Settings > Environment Variables.'
  }
  return null
}

export async function login(formData: FormData) {
  try {
    const configError = checkConfig()
    if (configError) return { error: configError }

    const email = (formData.get('email') as string)?.trim()
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
      try {
        const dbUser = await prisma.usuario.findUnique({ where: { id: data.user.id } });
        if (!dbUser) {
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
      } catch (dbErr: any) {
        console.error('Error sincronizando usuario en DB:', dbErr)
      }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('Error imprevisto en login:', err)
    return { error: err?.message || 'Error del servidor al iniciar sesión.' }
  }
}

export async function signup(formData: FormData) {
  try {
    const configError = checkConfig()
    if (configError) return { error: configError }

    const email = (formData.get('email') as string)?.trim()
    const password = formData.get('password') as string
    const empresaId = (formData.get('empresaId') as string)?.trim()
    const nuevaEmpresaNombre = (formData.get('nuevaEmpresaNombre') as string)?.trim()

    if (!email || !password || (!empresaId && !nuevaEmpresaNombre)) {
      return { error: 'Faltan campos por completar' }
    }

    let empresa = null;

    if (empresaId) {
      empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
      if (!empresa) return { error: 'El ID de Invitación no existe' };
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) return { error: error.message }

    if (!data.user) {
      return { error: 'No se pudo crear el usuario en Supabase Auth.' }
    }

    if (!empresa && nuevaEmpresaNombre) {
      empresa = await prisma.empresa.create({
        data: { nombre: nuevaEmpresaNombre }
      });
    }

    if (empresa) {
      await prisma.usuario.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          empresaId: empresa.id,
          rol: empresaId ? "OPERADOR" : "ADMIN"
        }
      });
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('Error imprevisto en signup:', err)
    return { error: err?.message || 'Error del servidor al registrarse.' }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
