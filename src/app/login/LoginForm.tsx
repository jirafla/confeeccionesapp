'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { toast } from 'sonner'
import { Scissors } from 'lucide-react'

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
          <Scissors className="w-6 h-6" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
      </h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        Accede al panel de control de tu empresa
      </p>

      <form 
        action={async (formData) => {
          setIsLoading(true);
          const result = isLogin ? await login(formData) : await signup(formData);
          
          if (result?.error) {
            toast.error(result.error);
            setIsLoading(false);
          }
        }} 
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            name="email" 
            required 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="usuario@empresa.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            name="password" 
            required 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="••••••••"
          />
        </div>

        {!isLogin && (
          <div className="space-y-4 border-t pt-4 mt-4">
            <p className="text-sm font-semibold text-gray-700">Opciones de Empresa</p>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="empresaAction" value="join" defaultChecked onChange={(e) => {
                  document.querySelector('.join-group')?.classList.remove('hidden');
                  document.querySelector('.create-group')?.classList.add('hidden');
                }} className="text-blue-600 focus:ring-blue-500" />
                Unirme con invitación
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="empresaAction" value="create" onChange={(e) => {
                  document.querySelector('.create-group')?.classList.remove('hidden');
                  document.querySelector('.join-group')?.classList.add('hidden');
                }} className="text-blue-600 focus:ring-blue-500" />
                Crear nueva empresa
              </label>
            </div>
            
            <div className="join-group">
              <input 
                type="text" 
                name="empresaId" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="ID de Invitación (Ej: cmv...)"
              />
            </div>
            <div className="create-group hidden">
              <input 
                type="text" 
                name="nuevaEmpresaNombre" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Nombre de tu Empresa (Ej: Confecciones Sunset)"
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Crear Cuenta')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  )
}
