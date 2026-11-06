import { Outlet } from 'react-router-dom'
import Encabezado from '../components/Encabezado'
import Pie from '../components/Pie'

export default function LayoutBase() {
  return (
    <div className="flex min-h-screen flex-col">
      <Encabezado />
      <main id="contenido" className="flex-1">
                <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
      <Pie />
    </div>
  )
}
