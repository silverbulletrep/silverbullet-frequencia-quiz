import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Suspense, useEffect, lazy } from "react";
import AuthorityHeader from "./components/AuthorityHeader";
import SkeletonFallback from "./components/SkeletonFallback";
import PageTransition from "./components/PageTransition";
import { ExitIntentGlobal } from "./hooks/useExitIntent";

// Eager imports para rotas de entrada principais (melhor FCP)
import InitialQuestions from "@/pages/InitialQuestions";
import Home from "@/pages/Home";
import Start from "@/pages/Start";

// Lazy imports - chunks separados pelo Vite
const AgeSelectionWomen = lazy(() => import("@/pages/AgeSelectionWomen"));
const AgeSelectionMen = lazy(() => import("@/pages/AgeSelectionMen"));
const WomenSuccess = lazy(() => import("@/pages/WomenSuccess"));
const MenSuccess = lazy(() => import("@/pages/MenSuccess"));
const MorningFeeling = lazy(() => import("@/pages/MorningFeeling"));
const TransitionPage = lazy(() => import("@/pages/TransitionPage"));
const VSL = lazy(() => import("@/pages/VSL"));
const VSL2 = lazy(() => import("@/pages/VSL2"));
const AudioUpsell = lazy(() => import("@/pages/AudioUpsell"));
const QuizStep1 = lazy(() => import("@/pages/QuizStep1"));
const QuizStep2 = lazy(() => import("@/pages/QuizStep2"));
const QuizStep3 = lazy(() => import("@/pages/QuizStep3"));
const QuizStep4 = lazy(() => import("@/pages/QuizStep4"));
const QuizStep5 = lazy(() => import("@/pages/QuizStep5"));
const QuizStep6 = lazy(() => import("@/pages/QuizStep6"));
const QuizStep9 = lazy(() => import("@/pages/QuizStep9"));
const QuizStep10 = lazy(() => import("@/pages/QuizStep10"));
const ProcessingPage = lazy(() => import("@/pages/ProcessingPage"));
const Resultado = lazy(() => import("@/pages/Resultado"));
const PresselResultado = lazy(() => import("@/pages/PresselResultado"));

const Fim = lazy(() => import("@/pages/Fim"));
const FimFunil = lazy(() => import("@/pages/FimFunil"));
const Recupera = lazy(() => import("@/pages/Recupera"));
const TikTokTrackerTest = lazy(() => import("@/pages/TikTokTrackerTest"));
const Componenetes = lazy(() => import("@/pages/Componenetes"));
const JohannChat = lazy(() => import("@/pages/JohannChat"));
const CompontTest1 = lazy(() => import("@/pages/CompontTest1"));
const CompontTest2 = lazy(() => import("@/pages/CompontTest2"));
const CompontTest3 = lazy(() => import("@/pages/CompontTest3"));
const CompontTest4 = lazy(() => import("@/pages/CompontTest4"));
const CompontTest5 = lazy(() => import("@/pages/CompontTest5"));
const CompontTest6 = lazy(() => import("@/pages/CompontTest6"));
const ProcessingPage2 = lazy(() => import("@/pages/ProcessingPage2"));
const ResultadoPage2 = lazy(() => import("@/pages/ResultadoPage2"));
const AlmaGemea = lazy(() => import("@/pages/AlmaGemea"));

import { useTranslation } from "react-i18next";

const DEBUG = import.meta.env.DEV

function getPathnamePrefix() {
  const { pathname } = window.location;
  // Detecta se a rota começa com /pt (considerando o possível subdiretório do deploy)
  const base = String(import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const pathWithoutBase = base ? pathname.slice(base.length) : pathname;
  const normalizedPath = pathWithoutBase.startsWith('/') ? pathWithoutBase : `/${pathWithoutBase}`;

  if (normalizedPath.startsWith('/pt/') || normalizedPath === '/pt') {
    return '/pt';
  }
  if (normalizedPath.startsWith('/de/') || normalizedPath === '/de') {
    return '/de';
  }
  return '';
}

function resolveRouterBasename(): string {
  const baseUrl = String(import.meta.env.BASE_URL || '/').trim().replace(/\/$/, '') || '';
  const prefix = getPathnamePrefix();

  const fullBasename = `${baseUrl}${prefix}`;
  if (!fullBasename || fullBasename === '') return '/';
  return fullBasename.startsWith('/') ? fullBasename : `/${fullBasename}`;
}

/**
 * Sincroniza o idioma do i18next com o prefixo da URL.
 */
function LanguageSync() {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const prefix = getPathnamePrefix();
    const targetLang = prefix === '/de' ? 'de' : 'pt';
    if (i18n.language !== targetLang) {
      if (DEBUG) console.log(`[APP] Alterando idioma para: ${targetLang} (prefixo: ${prefix})`);
      i18n.changeLanguage(targetLang);
    }
  }, [location.pathname, i18n]);

  return null;
}

function AppFallback() {
  return <SkeletonFallback />
}

export default function App() {
  const basename = resolveRouterBasename();
  if (DEBUG) console.log(`[APP] Router basename: "${basename}"`);

  return (
    <Router basename={basename}>
      <LanguageSync />
      <PersistUtmQuery />
      <BootHealthProbe />
      <HeaderAware />
      <ExitIntentGlobal />
      <Suspense fallback={<AppFallback />}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<InitialQuestions />} />
            <Route path="/age-selection-women" element={<AgeSelectionWomen />} />
            <Route path="/age-selection-men" element={<AgeSelectionMen />} />
            <Route path="/women-success" element={<WomenSuccess />} />
            <Route path="/men-success" element={<MenSuccess />} />
            <Route path="/morning-feeling" element={<MorningFeeling />} />
            <Route path="/transition" element={<TransitionPage />} />
            <Route path="/vsl" element={<VSL />} />
            <Route path="/vsl2" element={<VSL2 />} />
            <Route path="/audio-upsell" element={<AudioUpsell />} />
            <Route path="/quiz-step-1" element={<QuizStep1 />} />
            <Route path="/quiz-step-2" element={<QuizStep2 />} />
            <Route path="/quiz-step-3" element={<QuizStep3 />} />
            <Route path="/quiz-step-4" element={<QuizStep4 />} />
            <Route path="/quiz-step-5" element={<QuizStep5 />} />
            <Route path="/quiz-step-6" element={<QuizStep6 />} />
            <Route path="/quiz-step-9" element={<QuizStep9 />} />
            <Route path="/quiz-step-10" element={<QuizStep10 />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/resultado" element={<Resultado />} />
            <Route path="/resultado-pressel" element={<PresselResultado />} />

            <Route path="/start" element={<Start />} />
            <Route path="/fim" element={<Fim />} />
            <Route path="/fim-funil" element={<FimFunil />} />
            <Route path="/recupera" element={<Recupera />} />
            <Route path="/teste-traker-tiktok-build" element={<TikTokTrackerTest />} />
            <Route path="/componenetes" element={<Componenetes />} />
            <Route path="/chat-whatsapp" element={<JohannChat />} />
            <Route path="/compont-test-1" element={<CompontTest1 />} />
            <Route path="/compont-test-2" element={<CompontTest2 />} />
            <Route path="/compont-test-3" element={<CompontTest3 />} />
            <Route path="/compont-test-4" element={<CompontTest4 />} />
            <Route path="/compont-test-5" element={<CompontTest5 />} />
            <Route path="/compont-test-6" element={<CompontTest6 />} />
            <Route path="/processing2" element={<ProcessingPage2 />} />
            <Route path="/resultado2" element={<ResultadoPage2 />} />
            <Route path="/alma-gemea" element={<AlmaGemea />} />
            <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
          </Routes>
        </PageTransition>
      </Suspense>
    </Router>
  );
}

function PersistUtmQuery() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const isProd = import.meta.env.PROD
    if (!isProd) return

    const TRACK_KEYS = new Set([
      'fbclid',
      'gclid',
      'ttclid',
      'msclkid',
      'wbraid',
      'gbraid',
    ])

    const shouldPersistKey = (key: string) => {
      const k = String(key || '').trim()
      if (!k) return false
      if (k.toLowerCase().startsWith('utm_')) return true
      if (TRACK_KEYS.has(k.toLowerCase())) return true
      return false
    }

    const readPersisted = (): Record<string, string> => {
      try {
        const raw = sessionStorage.getItem('persisted_query_tracking')
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        return (parsed && typeof parsed === 'object') ? (parsed as Record<string, string>) : {}
      } catch {
        return {}
      }
    }

    const writePersisted = (next: Record<string, string>) => {
      try {
        sessionStorage.setItem('persisted_query_tracking', JSON.stringify(next))
      } catch {
        void 0
      }
    }

    const current = new URLSearchParams(location.search || '')
    const stored = readPersisted()
    let storedChanged = false

    current.forEach((value, key) => {
      if (!shouldPersistKey(key)) return
      const k = key.toLowerCase()
      const v = String(value || '')
      if (!v) return
      if (!stored[k]) {
        stored[k] = v
        storedChanged = true
      }
    })
    if (storedChanged) writePersisted(stored)

    let urlChanged = false
    Object.entries(stored).forEach(([k, v]) => {
      if (!v) return
      if (!current.has(k)) {
        current.set(k, v)
        urlChanged = true
      }
    })

    if (!urlChanged) return

    const nextSearch = current.toString()
    const currentSearch = String(location.search || '').replace(/^\?/, '')
    if (currentSearch === nextSearch) return

    try {
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : '',
          hash: location.hash || '',
        },
        { replace: true, state: location.state },
      )
    } catch {
      void 0
    }
  }, [location.pathname, location.search, location.hash, navigate])

  return null
}

function HeaderAware() {
  const location = useLocation();
  const hideOnPaths = new Set(["/checkout-success", "/recupera", "/chat-whatsapp"]);
  const hideHeader = hideOnPaths.has(location.pathname);
  if (hideHeader) return null;
  return <AuthorityHeader />;
}

function BootHealthProbe() {
  const { pathname } = useLocation()
  useEffect(() => {
    // Stripe probe removed to prevent routing interference
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }
    const skipPaths = new Set(['/quiz', '/', '/start'])
    const shouldSkip = skipPaths.has(pathname)
    if (shouldSkip) return
    const run = () => {
      ; (async () => {
        try {
          const { getApiHealth } = await import('./lib/api')
          const api = await getApiHealth().catch(() => ({ success: false }))
          if (DEBUG) console.log('[APP] Boot health', { api })
        } catch (error) {
          if (DEBUG) console.error(`[APP] Erro no boot health: ${error?.message}`)
        }
      })()
    }
    try {
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(run, { timeout: 2500 })
        return
      }
    } catch {
      void 0
    }
    const t = window.setTimeout(run, 1800)
    return () => { try { clearTimeout(t) } catch { void 0 } }
  }, [pathname])
  return null
}
