import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../style/juicer-tokens.css";
import "../style/home.css";
import SecaoInicio from "../components/SecaoInicio/SecaoInicio";
import ComoFunciona from "../components/comoFunciona/ComoFunciona";
import OQueAcompanhar from "../components/oQueAcompanhar/OQueAcompanhar";
import Planos from "../components/planos/Planos";
import Publicos from "../components/publicos/Publicos";
import OQueNaoFaz from "../components/oQueNaoFaz/OQueNaoFaz";
import SecaoSobre from "../components/home/sobreProjeto/SecaoSobre";
import CTAFinal from "../components/CTAFinal/CTAFinal";


export default function Home() {
    const location = useLocation()

    useEffect(() => {
        if (!location.hash) return
        const el = document.querySelector(location.hash)
        if (el) el.scrollIntoView({ behavior: "smooth" })
    }, [location])

    useEffect(() => {
        const els = document.querySelectorAll(".juicer .reveal");
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("in");
                        io.unobserve(e.target);
                    }
                }),
            { threshold: 0.12 }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

return (
    <div className="juicer">
    <SecaoInicio />
    <SecaoSobre />
    <ComoFunciona />
    <OQueAcompanhar />
    <Publicos />
    <OQueNaoFaz />
    <Planos />
    <CTAFinal />
      {/* <Footer /> */}
    </div>
);
}
