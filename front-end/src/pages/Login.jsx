import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import robotIcon from "../assets/chatbot.png"

const floatingCards = [
  { question: "Capital do Japão?", answer: "Tóquio", rotate: "-7deg", x: "-340px", y: "-60px", delay: 0 },
  { question: "Quem escreveu Dom Quixote?", answer: "Miguel de Cervantes", rotate: "5deg", x: "330px", y: "-80px", delay: 0.2 },
  { question: "Velocidade da luz?", answer: "299.792 km/s", rotate: "-5deg", x: "-310px", y: "140px", delay: 0.35 },
  { question: "Fórmula da glicose?", answer: "C₆H₁₂O₆", rotate: "8deg", x: "300px", y: "160px", delay: 0.5 },
];

export default function Login() {
  const pageRef = useRef(null);
  const cardRefs = useRef([]);
  const formCardRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const field1Ref = useRef(null);
  const field2Ref = useRef(null);
  const btnRef = useRef(null);
  const footerRef = useRef(null);
  const cursorGlowRef = useRef(null);

  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Define estados iniciais explicitamente ──
      gsap.set(
        [
          logoRef.current,
          formCardRef.current,
          titleRef.current,
          subtitleRef.current,
          field1Ref.current,
          field2Ref.current,
          btnRef.current,
          footerRef.current,
        ].filter(Boolean),
        { opacity: 0, y: 20 }
      );
      gsap.set(cardRefs.current.filter(Boolean), { opacity: 0, scale: 0.5 });

      // ── Cursor glow ──
      const onMove = (e) => {
        gsap.to(cursorGlowRef.current, {
          x: e.clientX - 250,
          y: e.clientY - 250,
          duration: 1.4,
          ease: "power3.out",
        });
      };
      window.addEventListener("mousemove", onMove);

      // ── Entrance timeline ──
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.to(logoRef.current, { y: 0, opacity: 1, duration: 0.6 })
        .to(formCardRef.current, { y: 0, opacity: 1, scale: 1, duration: 0.9 }, "-=0.3")
        .to(titleRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.6")
        .to(subtitleRef.current, { y: 0, opacity: 1, duration: 0.5 }, "-=0.45")
        .to([field1Ref.current, field2Ref.current], {
          y: 0, opacity: 1, duration: 0.5, stagger: 0.12,
        }, "-=0.4")
        .to(btnRef.current, { y: 0, opacity: 1, duration: 0.5 }, "-=0.3")
        .to(footerRef.current, { y: 0, opacity: 1, duration: 0.4 }, "-=0.2")
        .to(cardRefs.current.filter(Boolean), {
          scale: 1, opacity: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.7)",
        }, 0.2);

      // ── Float loop ──
      cardRefs.current.filter(Boolean).forEach((card, i) => {
        gsap.to(card, {
          y: `+=${12 + i * 3}`,
          rotation: `+=${1.5 + i * 0.8}`,
          duration: 2.8 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.4,
        });
      });

      // ── Mouse parallax ──
      const onParallax = (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        cardRefs.current.filter(Boolean).forEach((card, i) => {
          gsap.to(card, {
            x: `+=${dx * (i + 1) * 10}`,
            y: `+=${dy * (i + 1) * 10}`,
            duration: 1.6,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
        gsap.to(formCardRef.current, {
          rotateX: (dy * 3).toFixed(2),
          rotateY: (-dx * 3).toFixed(2),
          duration: 1.2,
          ease: "power2.out",
        });
      };
      window.addEventListener("mousemove", onParallax);

      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mousemove", onParallax);
      };
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = () => {
    // Faz a animação de clique e navega instantaneamente após concluída
    gsap.to(btnRef.current, {
      scale: 0.96,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        navigate("/weeks");
      }
    });
  };

  // Input focus animation
  const focusField = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1.015,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const blurField = (e) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.25, ease: "power2.out" });
  };

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen bg-[#f5f5ec] flex flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* Cursor glow */}
      <div
        ref={cursorGlowRef}
        className="pointer-events-none fixed w-[500px] h-[500px] rounded-full z-0"
        style={{
          background: "radial-gradient(circle, rgba(45,106,79,0.10) 0%, transparent 70%)",
          top: 0, left: 0,
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, #b7d5c4 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-[#d8eddf] opacity-40 blur-3xl z-0" />
      <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-[#c8e6d4] opacity-30 blur-3xl z-0" />

      {/* Floating flashcards */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {floatingCards.map((card, i) => (
          <div
            key={i}
            ref={(el) => (cardRefs.current[i] = el)}
            className="absolute bg-white rounded-2xl shadow-md border border-gray-100 p-4 w-44 text-left"
            style={{ transform: `rotate(${card.rotate})`, translate: `${card.x} ${card.y}` }}
          >
            <p className="text-[10px] font-semibold text-[#2d6a4f] uppercase tracking-widest mb-1">Flashcard</p>
            <p className="text-[12px] font-bold text-gray-700 mb-2 leading-snug">{card.question}</p>
            <div className="border-t border-dashed border-gray-200 pt-2">
              <p className="text-[11px] text-gray-400">{card.answer}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logo */}
      <div ref={logoRef} className="relative z-20 mb-8 flex items-center gap-2 text-gray-800 font-extrabold text-xl">
        <img src={robotIcon} alt="Logo" className="w-8 h-8" /> REVISAI
      </div>

      {/* Form card */}
      <div
        ref={formCardRef}
        className="relative z-20 w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl px-8 py-10"
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        {/* Green accent line */}
        <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-[#2d6a4f] via-[#52b788] to-[#2d6a4f] rounded-full" />

        <div ref={titleRef} className="mb-1">
          <h1 className="text-2xl font-extrabold text-gray-800">Bem-vindo de volta 👋</h1>
        </div>
        <p ref={subtitleRef} className="text-sm text-gray-400 mb-8">
          Continue de onde parou. Seu cérebro agradece.
        </p>

        {/* Email */}
        <div ref={field1Ref} className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={focusField}
            onBlur={blurField}
            placeholder="seu@email.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#fafaf8] text-gray-800 text-sm placeholder-gray-300 outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 transition-all"
          />
        </div>

        {/* Password */}
        <div ref={field2Ref} className="mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Senha
            </label>
          </div>
          <div className="relative flex flex-col">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={focusField}
              onBlur={blurField}
              placeholder="••••••••"
              className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-[#fafaf8] text-gray-800 text-sm placeholder-gray-300 outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 transition-all pr-11"
            />
            <button
              tabIndex={-1}
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? (
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            <button className="text-xs text-[#2d6a4f] hover:underline font-medium self-end mt-2">
              Esqueci a senha
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          ref={btnRef}
          onClick={handleSubmit}
          className="w-full py-3.5 mt-2 rounded-xl bg-[#2d6a4f] text-white font-bold text-sm tracking-wide hover:bg-[#1b4332] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
        >
          Entrar na conta <span>→</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300 font-medium">ou continue com</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Footer */}
        <p ref={footerRef} className="text-center text-xs text-gray-400 mt-7">
          Não tem conta?{" "}
          <a href="#" className="text-[#2d6a4f] font-semibold hover:underline">
            Criar conta grátis
          </a>
        </p>
      </div>

      {/* Bottom copy */}
      <p className="relative z-20 mt-6 text-xs text-[#2d6a4f]">
        © 2025 RevisAI · Todos os direitos reservados
      </p>
    </div>
  );
}