import { lazy, Suspense, useState } from 'react'
import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

/* layouts */
import AtletaLayout from './layout/AtletaLayout'
import MedicoLayout from './layout/MedicoLayout'

/* páginas públicas */
import Home from './pages/Home'

/* páginas do atleta */

/* páginas do médico */

/* acessibilidade */
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AccessibilityMenu from './components/Acessibilidade/AccessibilityMenu'
import LeitorDeAudio from './components/Acessibilidade/LeitorDeAudio/AudioReader'
import { ClinicalProvider } from './context/ClinicalContext'
import './style/accountTypography.css'

const Privacidade = lazy(() => import('./pages/Privacidade'))
const Termos = lazy(() => import('./pages/Termos'))
const Login = lazy(() => import('./pages/Login'))
const MapaCorporal = lazy(() => import('./pages/MapaCorporal'))
const Simulador = lazy(() => import('./pages/Simulador'))
const Referencias = lazy(() => import('./pages/Referencias'))
const PerfilAtleta = lazy(() => import('./pages/PerfilAtleta'))
const DadosConta = lazy(() => import('./components/DadosContaAtleta'))
const HistoricoExames = lazy(() => import('./components/HistoricoExames'))
const Acompanhamento = lazy(() => import('./pages/Acompanhamento'))
const MeusAtletas = lazy(() => import('./pages/MeusAtletas'))
const PerfilAtletaMedico = lazy(() => import('./pages/PerfilAtletaMedico'))
const DadosContaMedico = lazy(() => import('./components/DadosContaMedico'))

export default function App() {
    const [mostrarLeitor, setMostrarLeitor] = useState(false)

    return (
        <AuthProvider>
            <ClinicalProvider>
                <Suspense fallback={<p role="status">Carregando página…</p>}><Routes>

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

                </Routes></Suspense>

                <AccessibilityMenu onOpenAudioReader={() => setMostrarLeitor(true)} />
                {mostrarLeitor && <LeitorDeAudio onClose={() => setMostrarLeitor(false)} />}
            </ClinicalProvider>
        </AuthProvider>
    )
}
