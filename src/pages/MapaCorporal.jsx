import HumanBody from "../components/home/HumanBody"
import TituloSubtitulo from "../components/TituloSubtitulo"
import { useTranslation } from "../context/language"
import '../style/MapaCorporal.css'

const T = {
    pt: {
        titulo: "Impacto no Seu Corpo",
        subtitulo: "Clique em cada órgão para saber como os esteroides anabolizantes o afetam.",
    },
    en: {
        titulo: "Impact on Your Body",
        subtitulo: "Click on each organ to find out how anabolic steroids affect it.",
    },
}

export default function MapaCorporal() {
    const t = useTranslation(T, "MapaCorporal.T")

    return (
        <section id="mapa-corporal" className="mapa_corporal_page">
            <TituloSubtitulo
                titulo={t.titulo}
                subtitulo={t.subtitulo}
                variante="escuro"
            />
            <HumanBody />
        </section>
    )
}
