import { signInWithPopup } from 'firebase/auth'
import { auth, proveedorGoogle } from './firebase'

// true si Google abrió sesión; false si se canceló, el navegador bloqueó la ventana o falló.
export async function ingresarConGoogle(): Promise<boolean> {
  try {
    await signInWithPopup(auth, proveedorGoogle)
    return true
  } catch {
    return false
  }
}