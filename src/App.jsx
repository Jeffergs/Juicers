import { lazy, Suspense, useState } from 'react'
import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

/* layouts */
import AtletaLayout from './layout/AtletaLayout'
import MedicoLayout from './layout/MedicoLayout'

/* páginas públicas */
import Home from './pages/Home'
import Login from './pages/Login'
import MapaCorporal from './pages/MapaCorporal'
import Simulador from './pages/Simulador'
import Referencias from "./pages/Referencias";

/* páginas do atleta */
import PerfilAtleta from './pages/PerfilAtleta'
import DadosConta from './components/DadosContaAtleta'
import HistoricoExames from './components/HistoricoExames'
import Acompanhamento from './pages/Acompanhamento'

/* páginas do médico */
import MeusAtletas from './pages/MeusAtletas'
import PerfilAtletaMedico from './pages/PerfilAtletaMedico'
import DadosContaMedico from './components/DadosContaMedico'

/* acessibilidade */
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AccessibilityMenu from './components/Acessibilidade/AccessibilityMenu'
import LeitorDeAudio from './components/Acessibilidade/LeitorDeAudio/AudioReader'
import { ClinicalProvider } from './context/ClinicalContext'
import './style/accountTypography.css'

const Privacidade = lazy(() => import('./pages/Privacidade'))
const Termos = lazy(() => import('./pages/Termos'))

export default function App() {
    const [mostrarLeitor, setMostrarLeitor] = useState(false)

    return (
        <AuthProvider>
            <ClinicalProvider>
                <Routes>

                {/* Rotas públicas com Navbar + Footer */}
                <Route element={<><Navbar /><Outlet /><Footer /></>}>
                    <Route path="/" element={<Home />} />
                    <Route path="/mapa-corporal" element={<MapaCorporal />} />
                    <Route path="/simulador" element={<Simulador />} />
                    <Route path="/referencias" element={<Referencias />} />
                    <Route path="/privacidade" element={<Suspense fallback={<p role="status">Carregando documento…</p>}><Privacidade /></Suspense>} />
                    <Route path="/termos" element={<Suspense fallback={<p role="status">Carregando documento…</p>}><Termos /></Suspense>} />
                </Route>

                    {/* Login */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro/:token" element={<Login />} />

                    {/* Área do atleta */}
                    <Route path="/perfil" element={
                        <ProtectedRoute role="atleta">
                            <AtletaLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<PerfilAtleta />} />
                        <Route path="historico-exames" element={<HistoricoExames />} />
                        <Route path="acompanhamento" element={<Acompanhamento />} />   {/* NOVO */}
                        <Route path="dados-da-conta" element={<DadosConta embedded />} />
                    </Route>

                    {/* Área do médico */}
                    <Route path="/medico" element={
                        <ProtectedRoute role="medico">
                            <MedicoLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<MeusAtletas />} />
                        <Route path="atleta/:id" element={<PerfilAtletaMedico />} />
                        <Route path="dados-da-conta" element={<DadosContaMedico />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />

                </Routes>

                <AccessibilityMenu onOpenAudioReader={() => setMostrarLeitor(true)} />
                {mostrarLeitor && <LeitorDeAudio onClose={() => setMostrarLeitor(false)} />}
            </ClinicalProvider>
        </AuthProvider>
    )
}
