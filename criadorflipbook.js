import { useState, useRef, useEffect, useCallback } from "react";

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap";

const THEMES = {
  tce: { name: "TCE-MT Institucional", primary: "#1a3a5c", secondary: "#c9a84c", accent: "#2e7d6f", bg: "#f1efe8", text: "#1a1a1a", pageBg: "#ffffff" },
  proMulher: { name: "TCE Pró-Mulher", primary: "#6b2c5e", secondary: "#d4a053", accent: "#c44569", bg: "#fdf6f0", text: "#2d1b2e", pageBg: "#ffffff" },
  modern: { name: "Moderno Escuro", primary: "#0f0f0f", secondary: "#e8e8e8", accent: "#ff6b35", bg: "#1a1a1a", text: "#f0f0f0", pageBg: "#262626" },
  clean: { name: "Limpo Editorial", primary: "#2c3e50", secondary: "#3498db", accent: "#e74c3c", bg: "#fafafa", text: "#2c3e50", pageBg: "#ffffff" },
  nature: { name: "Sustentável", primary: "#2d5016", secondary: "#8fbc5a", accent: "#d4a017", bg: "#f0f4e8", text: "#1a2e0a", pageBg: "#fafdf5" },
};

const PAGE_TEMPLATES = {
  cover: { id: "cover", name: "Capa", icon: "📕" },
  title: { id: "title", name: "Página de Título", icon: "📄" },
  text: { id: "text", name: "Texto", icon: "📝" },
  imageText: { id: "imageText", name: "Imagem + Texto", icon: "🖼️" },
  twoColumns: { id: "twoColumns", name: "Duas Colunas", icon: "📰" },
  gallery: { id: "gallery", name: "Galeria", icon: "🎨" },
  quote: { id: "quote", name: "Citação", icon: "💬" },
  pdfPage: { id: "pdfPage", name: "Página PDF", icon: "📋" },
  backCover: { id: "backCover", name: "Contracapa", icon: "📗" },
};

const createPage = (template = "text", index) => ({
  id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${index || 0}`,
  template, title: "", subtitle: "", body: "", image: null, imageAlt: "", quote: "", quoteAuthor: "",
});

// ─── PDF Importer Hook ───
function usePdfImporter() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const pdfjsLoaded = useRef(false);

  const loadPdfJs = useCallback(async () => {
    if (pdfjsLoaded.current && window.pdfjsLib) return window.pdfjsLib;
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="pdf.min.js"]')) {
        const check = setInterval(() => { if (window.pdfjsLib) { clearInterval(check); pdfjsLoaded.current = true; resolve(window.pdfjsLib); } }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error("Timeout carregando PDF.js")); }, 15000);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const lib = window.pdfjsLib;
        lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        pdfjsLoaded.current = true;
        resolve(lib);
      };
      script.onerror = () => reject(new Error("Falha ao carregar PDF.js"));
      document.head.appendChild(script);
    });
  }, []);

  const importPdf = useCallback(async (file) => {
    setLoading(true); setError(null); setProgress({ current: 0, total: 0 });
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      setProgress({ current: 0, total: totalPages });
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        setProgress({ current: i, total: totalPages });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        pages.push({ ...createPage("pdfPage", i), image: canvas.toDataURL("image/jpeg", 0.85), title: `Página ${i}` });
      }
      setLoading(false);
      return pages;
    } catch (err) { setError(err.message || "Erro ao importar PDF"); setLoading(false); return []; }
  }, [loadPdfJs]);

  return { importPdf, loading, progress, error };
}

// ─── Flipbook Page Renderer ───
function FlipbookPage({ page, theme, pageNumber, totalPages, brandLogo }) {
  const t = THEMES[theme] || THEMES.tce;
  const base = { width: "100%", height: "100%", background: t.pageBg, color: t.text, fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", borderRadius: "2px", boxShadow: "inset -2px 0 8px rgba(0,0,0,0.06)" };
  const bar = <div style={{ height: "4px", background: `linear-gradient(90deg, ${t.primary}, ${t.secondary})`, width: "100%", flexShrink: 0 }} />;
  const foot = <div style={{ padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${t.primary}15`, fontSize: "10px", color: t.primary + "88", fontFamily: "'Space Mono', monospace", flexShrink: 0 }}><span></span><span>{pageNumber}/{totalPages}</span></div>;

  if (page.template === "pdfPage") return <div style={{ ...base, padding: 0 }}>{page.image ? <img src={page.image} alt={page.title || ""} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} /> : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: t.primary + "44" }}>PDF</div>}</div>;

  if (page.template === "cover") return (
    <div style={{ ...base, background: `linear-gradient(135deg, ${t.primary} 0%, ${t.primary}dd 60%, ${t.accent} 100%)`, color: "#fff", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "40px" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
      {brandLogo && <img src={brandLogo} alt="Logo" style={{ maxWidth: "120px", maxHeight: "80px", marginBottom: "24px", filter: "brightness(0) invert(1)", objectFit: "contain" }} />}
      <div style={{ width: "60px", height: "3px", background: t.secondary, margin: "0 auto 20px", borderRadius: "2px" }} />
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 12px" }}>{page.title || "Título"}</h1>
      {page.subtitle && <p style={{ fontSize: "clamp(12px, 2vw, 15px)", opacity: 0.85, fontWeight: 300, maxWidth: "80%", margin: "0 auto", lineHeight: 1.5 }}>{page.subtitle}</p>}
      <div style={{ width: "60px", height: "3px", background: t.secondary, margin: "20px auto 0", borderRadius: "2px" }} />
    </div>
  );

  if (page.template === "title") return <div style={base}>{bar}<div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 30px", textAlign: "center" }}><div style={{ width: "40px", height: "3px", background: t.secondary, margin: "0 auto 16px", borderRadius: "2px" }} /><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: 600, color: t.primary, margin: "0 0 12px" }}>{page.title || "Seção"}</h2>{page.subtitle && <p style={{ fontSize: "14px", color: t.text + "99", maxWidth: "85%", margin: "0 auto", lineHeight: 1.6 }}>{page.subtitle}</p>}</div>{foot}</div>;

  if (page.template === "quote") return <div style={base}>{bar}<div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 30px" }}><div style={{ fontSize: "48px", color: t.secondary, lineHeight: 1, marginBottom: "8px", fontFamily: "'Playfair Display', serif" }}>"</div><blockquote style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px, 2.5vw, 22px)", fontStyle: "italic", color: t.primary, lineHeight: 1.5, margin: "0 0 16px", paddingLeft: "16px", borderLeft: `3px solid ${t.secondary}` }}>{page.quote || "Citação..."}</blockquote>{page.quoteAuthor && <p style={{ fontSize: "13px", color: t.accent, fontWeight: 600, paddingLeft: "16px" }}>— {page.quoteAuthor}</p>}</div>{foot}</div>;

  if (page.template === "imageText") return <div style={base}>{bar}<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>{page.image && <div style={{ height: "45%", overflow: "hidden", flexShrink: 0 }}><img src={page.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}<div style={{ flex: 1, padding: "16px 24px", overflow: "auto" }}>{page.title && <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: t.primary, margin: "0 0 8px" }}>{page.title}</h3>}<p style={{ fontSize: "13px", lineHeight: 1.7, color: t.text + "dd", margin: 0, whiteSpace: "pre-wrap" }}>{page.body || "Texto..."}</p></div></div>{foot}</div>;

  if (page.template === "twoColumns") { const pts = (page.body || "Col 1\n---\nCol 2").split("\n---\n"); return <div style={base}>{bar}<div style={{ padding: "16px 24px 0" }}>{page.title && <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: t.primary, margin: "0 0 12px" }}>{page.title}</h3>}</div><div style={{ flex: 1, display: "flex", gap: "16px", padding: "0 24px 16px", overflow: "auto" }}><div style={{ flex: 1, fontSize: "12px", lineHeight: 1.7, color: t.text + "dd", whiteSpace: "pre-wrap" }}>{pts[0]}</div><div style={{ width: "1px", background: t.primary + "15", flexShrink: 0 }} /><div style={{ flex: 1, fontSize: "12px", lineHeight: 1.7, color: t.text + "dd", whiteSpace: "pre-wrap" }}>{pts[1] || ""}</div></div>{foot}</div>; }

  if (page.template === "gallery") return <div style={base}>{bar}<div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 24px" }}>{page.title && <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: t.primary, margin: "0 0 12px" }}>{page.title}</h3>}{page.image ? <div style={{ flex: 1, borderRadius: "6px", overflow: "hidden" }}><img src={page.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div> : <div style={{ flex: 1, borderRadius: "6px", border: `2px dashed ${t.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", color: t.primary + "66", fontSize: "14px" }}>Adicione imagem</div>}{page.body && <p style={{ fontSize: "11px", color: t.text + "99", textAlign: "center", margin: "8px 0 0", fontStyle: "italic" }}>{page.body}</p>}</div>{foot}</div>;

  if (page.template === "backCover") return <div style={{ ...base, background: `linear-gradient(135deg, ${t.primary} 0%, ${t.primary}ee 100%)`, color: "#fff", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "40px" }}>{brandLogo && <img src={brandLogo} alt="" style={{ maxWidth: "100px", maxHeight: "60px", marginBottom: "20px", filter: "brightness(0) invert(1)", objectFit: "contain" }} />}<p style={{ fontSize: "14px", opacity: 0.8, maxWidth: "80%", lineHeight: 1.6 }}>{page.body || "Obrigado"}</p>{page.subtitle && <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "12px" }}>{page.subtitle}</p>}</div>;

  return <div style={base}>{bar}<div style={{ flex: 1, padding: "20px 24px", overflow: "auto" }}>{page.title && <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: t.primary, margin: "0 0 10px" }}>{page.title}</h3>}<p style={{ fontSize: "13px", lineHeight: 1.75, color: t.text + "dd", margin: 0, whiteSpace: "pre-wrap" }}>{page.body || "Conteúdo..."}</p></div>{foot}</div>;
}

// ─── Flipbook Viewer ───
function FlipbookViewer({ pages, theme, brandLogo, currentPage, setCurrentPage }) {
  const t = THEMES[theme] || THEMES.tce;
  const total = pages.length;
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState(null);
  const touchRef = useRef(null);

  const goNext = useCallback(() => { if (currentPage < total - 1 && !flipping) { setFlipping(true); setFlipDir("next"); setTimeout(() => { setCurrentPage(p => Math.min(p + 1, total - 1)); setFlipping(false); setFlipDir(null); }, 450); } }, [currentPage, total, flipping, setCurrentPage]);
  const goPrev = useCallback(() => { if (currentPage > 0 && !flipping) { setFlipping(true); setFlipDir("prev"); setTimeout(() => { setCurrentPage(p => Math.max(p - 1, 0)); setFlipping(false); setFlipDir(null); }, 450); } }, [currentPage, flipping, setCurrentPage]);

  useEffect(() => { const h = (e) => { if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); } if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [goNext, goPrev]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
      <div
        onTouchStart={e => { touchRef.current = e.touches[0].clientX; }}
        onTouchEnd={e => { if (touchRef.current === null) return; const d = touchRef.current - e.changedTouches[0].clientX; if (Math.abs(d) > 50) d > 0 ? goNext() : goPrev(); touchRef.current = null; }}
        style={{ perspective: "1200px", width: "min(480px, 90vw)", aspectRatio: "3/4", position: "relative" }}>
        <div style={{ position: "absolute", bottom: "-10px", left: "10%", right: "10%", height: "20px", background: "radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(4px)" }} />
        <div style={{
          width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d",
          transition: flipping ? "transform 0.45s cubic-bezier(0.4,0,0.2,1)" : "none",
          transform: flipping ? (flipDir === "next" ? "rotateY(-12deg) scale(0.98)" : "rotateY(12deg) scale(0.98)") : "rotateY(0)",
          borderRadius: "4px", boxShadow: "0 2px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)", overflow: "hidden",
        }}>
          {pages[currentPage] && <FlipbookPage page={pages[currentPage]} theme={theme} pageNumber={currentPage + 1} totalPages={total} brandLogo={brandLogo} />}
        </div>
        <div onClick={goPrev} style={{ position: "absolute", top: 0, left: 0, width: "35%", height: "100%", cursor: currentPage > 0 ? "w-resize" : "default", zIndex: 10 }} />
        <div onClick={goNext} style={{ position: "absolute", top: 0, right: 0, width: "35%", height: "100%", cursor: currentPage < total - 1 ? "e-resize" : "default", zIndex: 10 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={goPrev} disabled={currentPage === 0} style={{ width: "36px", height: "36px", borderRadius: "50%", border: `1.5px solid ${t.primary}30`, background: "transparent", color: currentPage === 0 ? t.primary + "40" : t.primary, cursor: currentPage === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>‹</button>
        {total <= 20 ? <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>{pages.map((_, i) => <div key={i} onClick={() => !flipping && setCurrentPage(i)} style={{ width: i === currentPage ? "18px" : "6px", height: "6px", borderRadius: "3px", background: i === currentPage ? t.primary : t.primary + "30", cursor: "pointer", transition: "all 0.3s" }} />)}</div> : <span style={{ fontSize: "13px", fontFamily: "'Space Mono', monospace", color: t.primary }}>{currentPage + 1} / {total}</span>}
        <button onClick={goNext} disabled={currentPage === total - 1} style={{ width: "36px", height: "36px", borderRadius: "50%", border: `1.5px solid ${t.primary}30`, background: "transparent", color: currentPage === total - 1 ? t.primary + "40" : t.primary, cursor: currentPage === total - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>›</button>
      </div>
      <p style={{ fontSize: "11px", color: t.primary + "55", fontFamily: "'Space Mono', monospace", margin: 0 }}>← → ou toque nas laterais para navegar</p>
    </div>
  );
}

// ─── PDF Import Modal ───
function PdfImportModal({ onClose, onImport, theme }) {
  const t = THEMES[theme] || THEMES.tce;
  const { importPdf, loading, progress, error } = usePdfImporter();
  const fileRef = useRef(null);
  const [mode, setMode] = useState("replace");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const pages = await importPdf(file);
    if (pages.length > 0) onImport(pages, mode);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", maxWidth: "460px", width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: "12px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999" }}>×</button>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>📄</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: t.primary, margin: "0 0 6px" }}>Importar PDF</h3>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Cada página do PDF vira uma página do flipbook</p>
        </div>
        {!loading ? (<>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
            {[{ v: "replace", l: "Substituir tudo" }, { v: "append", l: "Adicionar ao final" }].map(o => (
              <button key={o.v} onClick={() => setMode(o.v)} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", border: mode === o.v ? `2px solid ${t.primary}` : "2px solid #e0e0e0", background: mode === o.v ? t.primary + "10" : "#fff", color: mode === o.v ? t.primary : "#666", fontWeight: mode === o.v ? 600 : 400 }}>{o.l}</button>
            ))}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: `2px dashed ${t.primary}40`, background: t.primary + "05", cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: t.primary, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>⬆️</span> Selecionar arquivo PDF
          </button>
          {error && <p style={{ color: "#e74c3c", fontSize: "13px", textAlign: "center", marginTop: "12px" }}>⚠️ {error}</p>}
        </>) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "100%", height: "8px", borderRadius: "4px", background: "#eee", overflow: "hidden", marginBottom: "12px" }}>
              <div style={{ height: "100%", borderRadius: "4px", background: `linear-gradient(90deg, ${t.primary}, ${t.accent})`, width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : "0%", transition: "width 0.3s" }} />
            </div>
            <p style={{ fontSize: "13px", color: t.primary, fontFamily: "'Space Mono', monospace" }}>Processando {progress.current} de {progress.total}...</p>
            <style>{`@keyframes flipPulse { 0%,80%,100% { opacity:.3; transform:scale(.8) } 40% { opacity:1; transform:scale(1.2) } }`}</style>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginTop: "12px" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.primary, animation: `flipPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Share / Embed Modal ───
function ShareModal({ onClose, pages, theme, brandLogo }) {
  const t = THEMES[theme] || THEMES.tce;
  const [copied, setCopied] = useState(null);

  const generateEmbedHtml = () => {
    const imgArr = pages.map(p => p.image || "");
    return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flipbook TCE-MT</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:${t.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh}
.fb{perspective:1200px;width:min(480px,90vw);aspect-ratio:3/4;position:relative;margin:20px 0}
.pg{width:100%;height:100%;position:absolute;top:0;left:0;border-radius:4px;box-shadow:0 2px 20px rgba(0,0,0,.15);overflow:hidden;transition:transform .45s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d;background:#fff}
.pg img{width:100%;height:100%;object-fit:contain}
.pg.flip-next{transform:rotateY(-12deg) scale(.98)}
.pg.flip-prev{transform:rotateY(12deg) scale(.98)}
.nav{display:flex;align-items:center;gap:12px}
.nav button{width:36px;height:36px;border-radius:50%;border:1.5px solid ${t.primary}30;background:transparent;color:${t.primary};cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center}
.nav button:disabled{color:${t.primary}40;cursor:default}
.ctr{font-size:13px;font-family:'Space Mono',monospace;color:${t.primary};min-width:60px;text-align:center}
.hint{font-size:11px;color:${t.primary}55;font-family:'Space Mono',monospace;margin-top:8px}
.shadow{position:absolute;bottom:-10px;left:10%;right:10%;height:20px;background:radial-gradient(ellipse,rgba(0,0,0,.2) 0%,transparent 70%);border-radius:50%;filter:blur(4px)}
.click-l,.click-r{position:absolute;top:0;height:100%;width:35%;z-index:10}
.click-l{left:0;cursor:w-resize}.click-r{right:0;cursor:e-resize}
</style></head><body>
<div class="fb" id="fb"><div class="shadow"></div><div class="pg" id="pg"></div><div class="click-l" onclick="prev()"></div><div class="click-r" onclick="next()"></div></div>
<div class="nav"><button onclick="prev()" id="pb">&#8249;</button><span class="ctr" id="ct"></span><button onclick="next()" id="nb">&#8250;</button></div>
<p class="hint">&larr; &rarr; ou toque nas laterais</p>
<script>
var imgs=${JSON.stringify(imgArr)};
var cur=0,tot=imgs.length,pg=document.getElementById('pg'),ct=document.getElementById('ct'),pb=document.getElementById('pb'),nb=document.getElementById('nb'),flipping=false;
function render(){ct.textContent=(cur+1)+' / '+tot;pb.disabled=cur===0;nb.disabled=cur===tot-1;if(imgs[cur]){pg.innerHTML='<img src="'+imgs[cur]+'" alt="Pag '+(cur+1)+'">';}else{pg.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999">Página '+(cur+1)+'</div>';}}
function flip(dir){if(flipping)return;flipping=true;pg.classList.add(dir==='next'?'flip-next':'flip-prev');setTimeout(function(){cur=dir==='next'?Math.min(cur+1,tot-1):Math.max(cur-1,0);pg.classList.remove('flip-next','flip-prev');render();flipping=false;},450);}
function next(){if(cur<tot-1)flip('next');}
function prev(){if(cur>0)flip('prev');}
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();next();}if(e.key==='ArrowLeft'){e.preventDefault();prev();}});
var ts=null;document.querySelector('.fb').addEventListener('touchstart',function(e){ts=e.touches[0].clientX;});document.querySelector('.fb').addEventListener('touchend',function(e){if(ts===null)return;var d=ts-e.changedTouches[0].clientX;if(Math.abs(d)>50){d>0?next():prev();}ts=null;});
render();
</script></body></html>`;
  };

  const iframeSnippet = `<!-- Flipbook TCE-MT -->
<iframe
  src="SEU_LINK/flipbook.html"
  width="100%"
  height="700"
  frameborder="0"
  style="border:none;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.1);"
  allowfullscreen>
</iframe>`;

  const copy = (text, id) => { navigator.clipboard.writeText(text).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000); }); };
  const download = () => { const b = new Blob([generateEmbedHtml()], { type: "text/html" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "flipbook-tce-mt.html"; a.click(); URL.revokeObjectURL(u); };

  const codeBlockStyle = { background: "#1a1a2e", color: "#e0e0ff", padding: "16px", borderRadius: "10px", fontSize: "11px", fontFamily: "'Space Mono', monospace", overflow: "auto", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", position: "relative" };
  const copyBtnStyle = (id) => ({ position: "absolute", top: "8px", right: "8px", padding: "4px 10px", borderRadius: "6px", border: "none", background: copied === id ? "#2ecc71" : "rgba(255,255,255,0.15)", color: "#fff", fontSize: "11px", cursor: "pointer", fontFamily: "'Space Mono', monospace" });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "560px", width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", position: "relative", maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: "12px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999" }}>×</button>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "36px", marginBottom: "6px" }}>🔗</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: t.primary, margin: "0 0 4px" }}>Compartilhar Flipbook</h3>
          <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>{pages.length} páginas · {THEMES[theme].name}</p>
        </div>

        {/* Step 1: Download */}
        <div style={{ marginBottom: "18px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: t.primary + "88", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px", fontFamily: "'Space Mono', monospace" }}>1. Baixar HTML autocontido</p>
          <button onClick={download} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: `0 4px 12px ${t.primary}40` }}>
            ⬇️ Baixar flipbook.html
          </button>
          <p style={{ fontSize: "11px", color: "#999", marginTop: "6px" }}>Arquivo HTML completo com todas as imagens embutidas. Basta hospedar no servidor.</p>
        </div>

        {/* Step 2: Iframe code */}
        <div style={{ marginBottom: "18px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: t.primary + "88", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px", fontFamily: "'Space Mono', monospace" }}>2. Código iframe para incorporar</p>
          <div style={codeBlockStyle}>
            <pre style={{ margin: 0 }}>{iframeSnippet}</pre>
            <button onClick={() => copy(iframeSnippet, "iframe")} style={copyBtnStyle("iframe")}>{copied === "iframe" ? "✓ Copiado!" : "Copiar"}</button>
          </div>
          <p style={{ fontSize: "11px", color: "#999", marginTop: "6px" }}>Substitua <code style={{ background: "#f0f0f0", padding: "1px 4px", borderRadius: "3px", fontSize: "10px" }}>SEU_LINK/flipbook.html</code> pela URL após hospedar</p>
        </div>

        {/* Step 3: Instructions */}
        <div style={{ background: t.primary + "08", borderRadius: "10px", padding: "16px" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: t.primary, margin: "0 0 8px" }}>📋 Passo a passo:</p>
          <ol style={{ fontSize: "12px", color: "#666", lineHeight: 1.9, paddingLeft: "18px", margin: 0 }}>
            <li>Baixe o arquivo <strong>flipbook.html</strong></li>
            <li>Hospede no servidor do TCE-MT ou intranet</li>
            <li>Copie o iframe e cole no portal, intranet ou email marketing</li>
            <li>O flipbook funciona em qualquer dispositivo, com navegação por toque e teclado</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── Page Editor ───
function PageEditor({ page, onChange, theme }) {
  const t = THEMES[theme] || THEMES.tce;
  const fileRef = useRef(null);
  const handleImg = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => onChange({ ...page, image: ev.target.result }); r.readAsDataURL(f); };
  const inp = { width: "100%", padding: "8px 10px", border: `1px solid ${t.primary}20`, borderRadius: "6px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", background: "#fff", color: t.text, outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: "11px", fontWeight: 600, color: t.primary + "aa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px", display: "block", fontFamily: "'Space Mono', monospace" };

  if (page.template === "pdfPage") return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: t.primary + "08", borderRadius: "8px", fontSize: "13px", color: t.primary, fontWeight: 500 }}><span>📋</span> Página importada do PDF</div>
      {page.image && <img src={page.image} alt="" style={{ width: "100%", borderRadius: "6px", border: `1px solid ${t.primary}10` }} />}
      <p style={{ fontSize: "12px", color: "#999" }}>Importada como imagem fidedigna ao original.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: t.primary + "08", borderRadius: "8px", fontSize: "13px", color: t.primary, fontWeight: 500 }}>
        <span>{PAGE_TEMPLATES[page.template]?.icon}</span>{PAGE_TEMPLATES[page.template]?.name}
      </div>
      {page.template !== "backCover" && <div><label style={lbl}>Título</label><input style={inp} value={page.title} onChange={e => onChange({ ...page, title: e.target.value })} placeholder="Título..." /></div>}
      {["cover", "title", "backCover"].includes(page.template) && <div><label style={lbl}>Subtítulo</label><input style={inp} value={page.subtitle} onChange={e => onChange({ ...page, subtitle: e.target.value })} placeholder="Subtítulo..." /></div>}
      {["text", "imageText", "twoColumns", "backCover", "gallery"].includes(page.template) && <div><label style={lbl}>{page.template === "twoColumns" ? "Texto (separe com ---)" : page.template === "gallery" ? "Legenda" : "Corpo"}</label><textarea style={{ ...inp, minHeight: "100px", resize: "vertical" }} value={page.body} onChange={e => onChange({ ...page, body: e.target.value })} /></div>}
      {page.template === "quote" && <><div><label style={lbl}>Citação</label><textarea style={{ ...inp, minHeight: "80px", resize: "vertical" }} value={page.quote} onChange={e => onChange({ ...page, quote: e.target.value })} /></div><div><label style={lbl}>Autor</label><input style={inp} value={page.quoteAuthor} onChange={e => onChange({ ...page, quoteAuthor: e.target.value })} /></div></>}
      {["imageText", "gallery"].includes(page.template) && <div><label style={lbl}>Imagem</label><input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} /><button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "10px", border: `1.5px dashed ${t.primary}30`, borderRadius: "8px", background: "transparent", color: t.primary + "88", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>{page.image ? "🔄 Trocar" : "📷 Upload"}</button>{page.image && <img src={page.image} alt="" style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "6px", marginTop: "6px" }} />}</div>}
    </div>
  );
}

// ─── Main App ───
export default function FlipbookCreator() {
  const [view, setView] = useState("editor");
  const [theme, setTheme] = useState("tce");
  const [brandLogo, setBrandLogo] = useState(null);
  const [pages, setPages] = useState([
    { ...createPage("cover", 0), title: "Programação Digital", subtitle: "Tribunal de Contas do Estado de Mato Grosso" },
    { ...createPage("text", 1), title: "Apresentação", body: "Bem-vindo à programação digital do TCE-MT. Aqui você encontra todas as informações sobre nossos eventos, capacitações e ações institucionais." },
    { ...createPage("quote", 2), quote: "Não fiscalizamos apenas contas, cuidamos de pessoas.", quoteAuthor: "TCE-MT" },
    { ...createPage("backCover", 3), body: "Tribunal de Contas do Estado de Mato Grosso\nwww.tce.mt.gov.br", subtitle: "Portas Abertas · Diálogo" },
  ]);
  const [sel, setSel] = useState(0);
  const [prevPg, setPrevPg] = useState(0);
  const [showPdf, setShowPdf] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const logoRef = useRef(null);
  const t = THEMES[theme];

  const addPage = (tpl) => { const np = [...pages]; np.splice(sel + 1, 0, createPage(tpl, pages.length)); setPages(np); setSel(sel + 1); };
  const removePage = (i) => { if (pages.length <= 1) return; const np = pages.filter((_, x) => x !== i); setPages(np); setSel(Math.min(sel, np.length - 1)); };
  const movePage = (i, d) => { const ni = i + d; if (ni < 0 || ni >= pages.length) return; const np = [...pages]; [np[i], np[ni]] = [np[ni], np[i]]; setPages(np); setSel(ni); };

  const handlePdfImport = (pdfPages, mode) => {
    if (mode === "replace") { setPages(pdfPages); setSel(0); } else { setPages([...pages, ...pdfPages]); setSel(pages.length); }
    setShowPdf(false);
  };

  useEffect(() => { if (!document.querySelector(`link[href*="DM+Sans"]`)) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = GOOGLE_FONTS_URL; document.head.appendChild(l); } }, []);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'DM Sans', sans-serif", color: t.text, transition: "background 0.3s" }}>
      {/* Top Bar */}
      <div style={{ background: t.primary, color: "#fff", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "52px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", flexWrap: "wrap", gap: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>📖</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 600 }}>Flipbook Creator</span>
          <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: "10px", fontFamily: "'Space Mono', monospace" }}>TCE-MT</span>
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {[{ label: "📄 Importar PDF", fn: () => setShowPdf(true) }, { label: "🔗 Compartilhar", fn: () => setShowShare(true) }].map((b, i) => (
            <button key={i} onClick={b.fn} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "#fff", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{b.label}</button>
          ))}
          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />
          {["editor", "preview"].map(v => (
            <button key={v} onClick={() => { setView(v); if (v === "preview") setPrevPg(sel); }} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: view === v ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", fontSize: "11px", fontWeight: view === v ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {v === "editor" ? "✏️ Editor" : "👁️ Preview"}
            </button>
          ))}
        </div>
      </div>

      {view === "editor" ? (
        <div style={{ display: "grid", gridTemplateColumns: "210px 1fr 280px", gap: 0, height: "calc(100vh - 52px)", overflow: "hidden" }}>
          {/* Left */}
          <div style={{ background: "#fff", borderRight: `1px solid ${t.primary}10`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px", borderBottom: `1px solid ${t.primary}10` }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: t.primary + "88", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px", fontFamily: "'Space Mono', monospace" }}>Páginas ({pages.length})</p>
              <select onChange={(e) => { if (e.target.value) addPage(e.target.value); e.target.value = ""; }} value="" style={{ width: "100%", padding: "7px 8px", borderRadius: "6px", border: `1.5px solid ${t.primary}20`, fontSize: "12px", fontFamily: "'DM Sans', sans-serif", color: t.primary, background: "#fff", cursor: "pointer" }}>
                <option value="">+ Adicionar página...</option>
                {Object.values(PAGE_TEMPLATES).filter(x => x.id !== "pdfPage").map(x => <option key={x.id} value={x.id}>{x.icon} {x.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "6px" }}>
              {pages.map((p, i) => (
                <div key={p.id} onClick={() => setSel(i)} style={{ padding: "6px 8px", borderRadius: "8px", marginBottom: "2px", background: i === sel ? t.primary + "10" : "transparent", border: i === sel ? `1.5px solid ${t.primary}30` : "1.5px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s" }}>
                  {p.template === "pdfPage" && p.image ? <img src={p.image} alt="" style={{ width: "26px", height: "34px", objectFit: "cover", borderRadius: "3px", border: `1px solid ${t.primary}15`, flexShrink: 0 }} /> : <span style={{ fontSize: "14px", flexShrink: 0, width: "26px", textAlign: "center" }}>{PAGE_TEMPLATES[p.template]?.icon}</span>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "11px", fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: t.primary }}>{p.title || PAGE_TEMPLATES[p.template]?.name}</p>
                    <p style={{ fontSize: "9px", color: t.primary + "55", margin: 0, fontFamily: "'Space Mono', monospace" }}>{i + 1}</p>
                  </div>
                  {i === sel && <div style={{ display: "flex", gap: "1px", flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); movePage(i, -1); }} style={{ width: "18px", height: "18px", border: "none", background: "transparent", cursor: "pointer", fontSize: "9px", color: t.primary + "88" }}>↑</button>
                    <button onClick={e => { e.stopPropagation(); movePage(i, 1); }} style={{ width: "18px", height: "18px", border: "none", background: "transparent", cursor: "pointer", fontSize: "9px", color: t.primary + "88" }}>↓</button>
                    <button onClick={e => { e.stopPropagation(); removePage(i); }} style={{ width: "18px", height: "18px", border: "none", background: "transparent", cursor: "pointer", fontSize: "9px", color: "#e74c3c88" }}>×</button>
                  </div>}
                </div>
              ))}
            </div>
          </div>

          {/* Center */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: t.bg, overflow: "auto" }}>
            <div style={{ width: "min(380px, 65vw)", aspectRatio: "3/4", boxShadow: "0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)", borderRadius: "4px", overflow: "hidden", flexShrink: 0 }}>
              {pages[sel] && <FlipbookPage page={pages[sel]} theme={theme} pageNumber={sel + 1} totalPages={pages.length} brandLogo={brandLogo} />}
            </div>
          </div>

          {/* Right */}
          <div style={{ background: "#fff", borderLeft: `1px solid ${t.primary}10`, overflow: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: t.primary + "88", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px", fontFamily: "'Space Mono', monospace" }}>Tema</p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {Object.entries(THEMES).map(([k, th]) => <button key={k} onClick={() => setTheme(k)} title={th.name} style={{ width: "30px", height: "30px", borderRadius: "8px", border: theme === k ? `2px solid ${th.primary}` : "2px solid transparent", background: `linear-gradient(135deg, ${th.primary} 50%, ${th.secondary} 50%)`, cursor: "pointer", transform: theme === k ? "scale(1.1)" : "scale(1)", transition: "all 0.2s" }} />)}
              </div>
              <p style={{ fontSize: "11px", color: t.primary + "88", margin: "4px 0 0" }}>{t.name}</p>
            </div>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: t.primary + "88", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 6px", fontFamily: "'Space Mono', monospace" }}>Logo</p>
              <input ref={logoRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setBrandLogo(ev.target.result); r.readAsDataURL(f); }} style={{ display: "none" }} />
              <button onClick={() => logoRef.current?.click()} style={{ width: "100%", padding: "7px", border: `1.5px dashed ${t.primary}25`, borderRadius: "8px", background: "transparent", color: t.primary + "77", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>{brandLogo ? "🔄 Trocar logo" : "📎 Upload logo"}</button>
              {brandLogo && <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}><img src={brandLogo} alt="" style={{ height: "24px", objectFit: "contain" }} /><button onClick={() => setBrandLogo(null)} style={{ border: "none", background: "transparent", color: "#e74c3c", cursor: "pointer", fontSize: "11px" }}>Remover</button></div>}
            </div>
            <div style={{ height: "1px", background: t.primary + "10" }} />
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: t.primary + "88", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px", fontFamily: "'Space Mono', monospace" }}>Editar Página {sel + 1}</p>
              {pages[sel] && <PageEditor page={pages[sel]} onChange={p => setPages(pages.map((x, i) => i === sel ? p : x))} theme={theme} />}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ minHeight: "calc(100vh - 52px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", background: t.bg }}>
          <FlipbookViewer pages={pages} theme={theme} brandLogo={brandLogo} currentPage={prevPg} setCurrentPage={setPrevPg} />
        </div>
      )}

      {showPdf && <PdfImportModal onClose={() => setShowPdf(false)} onImport={handlePdfImport} theme={theme} />}
      {showShare && <ShareModal onClose={() => setShowShare(false)} pages={pages} theme={theme} brandLogo={brandLogo} />}
    </div>
  );
}// JavaScript Document