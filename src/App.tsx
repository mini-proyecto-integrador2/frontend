import { Route, Routes } from 'react-router-dom'
import LayoutBase from './layouts/LayoutBase'
import Inicio from './pages/Inicio'
import BaseTecnica from './pages/BaseTecnica'
import NoEncontrada from './pages/NoEncontrada'
import EnConstruccion from './pages/EnConstruccion'
import Registro from './pages/Registro'
import RutaPrivada from './components/RutaPrivada'
import Ingresar from './pages/Ingresar'
import CompletarPerfil from './pages/CompletarPerfil'
import Panel from './pages/Panel'

// Rutas del mapa del sitio (C02). Las que aún no tienen historia muestran "En construcción".
export default function App() {
  return (
    <Routes>
      <Route element={<LayoutBase />}>
        {/* Públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/ingresar" element={<Ingresar />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/ayuda" element={<EnConstruccion titulo="Ayuda" sprint={6} />} />

        {/* Privadas (protegidas por RutaPrivada) */}
        <Route element={<RutaPrivada />}>
          <Route path="/completar-perfil" element={<CompletarPerfil />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/perfil" element={<EnConstruccion titulo="Perfil" sprint={2} />} />
          <Route path="/sala/:id" element={<EnConstruccion titulo="Sala" sprint={3} />} />
        </Route>

        {/* Apoyo */}
        <Route path="/base-tecnica" element={<BaseTecnica />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
