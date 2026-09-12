"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { resetGlobalTheme } from "@/lib/theme";
import { 
  Github, Globe, Terminal, Cpu, Brain, Layers, 
  Code2, ExternalLink, Sparkles, MapPin, Calendar, 
  Award, BookOpen, Database, Shield, Zap, Rocket, ChevronRight
} from "lucide-react";

export default function ProfilePage() {
  const [lang, setLang] = useState<"tr" | "en">("tr");

  useEffect(() => {
    resetGlobalTheme();
  }, []);

  // Calculate dynamic age from 2007-08-15
  const birthDate = new Date(2007, 7, 15);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const content = {
    tr: {
      heroBadge: "⚡ Açık Kaynak Geliştirici & Sistem Mühendisi",
      title: "Eren Özdemir",
      handle: "@KuraPiee",
      subtitle: "Elektrik - Elektronik Teknikeri & Full-Stack / AI Geliştirici",
      location: "İstanbul, Türkiye",
      experience: "13 yaşından beri (6+ yıl aktif kodlama)",
      ageText: `${age} yaşında`,
      bio: "13 yaşımda hobi olarak başlayan yazılım tutkumu; derin öğrenme, yapay zeka sistemleri, modern web mimarileri ve gömülü sistemlerle harmanlayan tutkulu bir geliştiriciyim. Elektrik - Elektronik altyapım sayesinde donanımdan yapay sinir ağlarına, mikroişlemcilerden distributed bulut sistemlerine kadar uçtan uca düşünebilen bir mühendislik vizyonuyla üretiyorum.",
      stats: {
        projects: "40+ Teslim Edilen Proje",
        repos: "15+ Açık Kaynak Repo",
        experience: "6+ Yıl Deneyim",
        uptime: "99.9% Tutku"
      },
      skillsTitle: "Yetenekler & Uzmanlıklar",
      skillsDesc: "Web ekosisteminin temellerinden sinir ağlarına kadar geniş bir teknoloji yelpazesi.",
      aiTitle: "Yapay Zeka & Derin Öğrenme Eğitimleri",
      aiDesc: "Akademik ve pratik düzeyde tamamlanan makine öğrenimi & derin öğrenme modülleri:",
      webTitle: "Web & Backend (Yutulmuş Seviyede)",
      mobileTitle: "Mobil & Düşük Seviye Diller",
      dbTitle: "Veritabanı & Altyapı",
      featuredTitle: "Öne Çıkan Projeler & Girişimler",
      viewGithub: "GitHub Profilini İncele",
      visitDocwyrm: "Docwyrm'e Git",
      visitBeadless: "Beadless'a Git",
      projects: [
        {
          name: "Docwyrm",
          badge: "Amiral Gemisi",
          desc: "Açık kaynak, self-hostable çoklu kitapçık ve tema marketplace destekli gelişmiş dokümantasyon platformu (GitBook alternatifi).",
          link: "https://docwyrm.com",
          tags: ["Next.js 15", "Express", "TypeScript", "Tailwind", "VDS / PM2"]
        },
        {
          name: "beadless",
          badge: "npm Paketi & MCP",
          desc: "AI coding agent'ları (Cursor, Claude Code, Antigravity) için Git-native, sıfır-Dolt ve saf TypeScript kalıcı hafıza motoru.",
          link: "https://github.com/KuraPiee/beadless",
          tags: ["npm package", "MCP SDK", "TypeScript", "Git-Native"]
        },
        {
          name: "fauxhuman",
          badge: "Açık Kaynak",
          desc: "Kurumsal bot tespit middleware'i, davranışsal skorlama motoru ve Playwright güvenlik test altyapısı.",
          link: "https://github.com/KuraPiee/fauxhuman",
          tags: ["TypeScript", "Fastify", "Redis", "Security"]
        },
        {
          name: "E-Kilit",
          badge: "SaaS Ürünü",
          desc: "Okullar ve kurumsal firmalar için akıllı tahta ve cihaz kilitleme / yönetim sistemi.",
          link: "https://github.com/KuraPiee",
          tags: ["Next.js", "Fastify", "PostgreSQL", "Electron"]
        }
      ]
    },
    en: {
      heroBadge: "⚡ Open Source Builder & Systems Developer",
      title: "Eren Özdemir",
      handle: "@KuraPiee",
      subtitle: "Electrical & Electronics Technician | Full-Stack & AI Developer",
      location: "Istanbul, Turkey",
      experience: "Coding since age 13 (6+ years active)",
      ageText: `${age} years old`,
      bio: "Starting my programming journey as a passion at age 13, I combine deep learning, AI agent systems, modern web architecture, and hardware fundamentals. With an Electrical & Electronics engineering foundation, I build end-to-end solutions—from microcontrollers and neural networks to distributed cloud platforms.",
      stats: {
        projects: "40+ Shipped Projects",
        repos: "15+ Open Source Repos",
        experience: "6+ Years Coding",
        uptime: "99.9% Passion"
      },
      skillsTitle: "Skills & Technical Expertise",
      skillsDesc: "From neural network architectures to production-grade distributed web applications.",
      aiTitle: "Artificial Intelligence & Deep Learning Trainings",
      aiDesc: "Completed rigorous practical and theoretical coursework in modern AI:",
      webTitle: "Web & Backend (Mastered)",
      mobileTitle: "Mobile & Systems Languages",
      dbTitle: "Databases & Cloud Architecture",
      featuredTitle: "Featured Products & Open Source",
      viewGithub: "View GitHub Profile",
      visitDocwyrm: "Visit Docwyrm",
      visitBeadless: "Visit Beadless",
      projects: [
        {
          name: "Docwyrm",
          badge: "Flagship",
          desc: "Open-source, self-hostable documentation platform with multi-space books and theme marketplace (GitBook alternative).",
          link: "https://docwyrm.com",
          tags: ["Next.js 15", "Express", "TypeScript", "Tailwind", "VDS / PM2"]
        },
        {
          name: "beadless",
          badge: "npm Package & MCP",
          desc: "Git-native, zero-Dolt, pure TypeScript persistent memory engine & MCP server for AI coding agents.",
          link: "https://github.com/KuraPiee/beadless",
          tags: ["npm package", "MCP SDK", "TypeScript", "Git-Native"]
        },
        {
          name: "fauxhuman",
          badge: "Open Source",
          desc: "Enterprise bot detection middleware, behavioral scoring engine & Playwright security test harness.",
          link: "https://github.com/KuraPiee/fauxhuman",
          tags: ["TypeScript", "Fastify", "Redis", "Security"]
        },
        {
          name: "E-Kilit",
          badge: "SaaS Product",
          desc: "SaaS smart board locking & centralized device management system for educational institutions.",
          link: "https://github.com/KuraPiee",
          tags: ["Next.js", "Fastify", "PostgreSQL", "Electron"]
        }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans antialiased selection:bg-[#58a6ff]/30 selection:text-white pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#58a6ff] to-[#bc8cff] flex items-center justify-center font-bold text-white shadow-lg shadow-[#58a6ff]/20">
            E
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">KuraPiee</span>
            <span className="text-xs text-[#8b949e] ml-2 hidden sm:inline">profile.docwyrm.com</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-lg p-1 text-xs font-semibold">
            <button
              onClick={() => setLang("tr")}
              className={`px-3 py-1 rounded transition-all ${
                lang === "tr" ? "bg-[#58a6ff] text-white shadow-sm" : "text-[#8b949e] hover:text-white"
              }`}
            >
              TR
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded transition-all ${
                lang === "en" ? "bg-[#58a6ff] text-white shadow-sm" : "text-[#8b949e] hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <a
            href="https://github.com/KuraPiee"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] text-white px-4 py-1.5 rounded-lg border border-[#30363d] text-sm font-medium transition"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        <section className="relative rounded-2xl border border-[#30363d] bg-gradient-to-b from-[#161b22] to-[#0d1117] p-8 sm:p-12 shadow-2xl overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#58a6ff]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#bc8cff]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58a6ff]/10 border border-[#58a6ff]/30 text-[#58a6ff] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {t.heroBadge}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {t.title} <span className="text-[#8b949e] text-2xl sm:text-3xl font-normal">({t.handle})</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#58a6ff] font-medium">
                {t.subtitle}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#8b949e] pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#bc8cff]" />
                  <span>{t.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#58a6ff]" />
                  <span>{t.ageText}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#3fb950]" />
                  <span>{t.experience}</span>
                </div>
              </div>

              <p className="text-base text-[#8b949e] leading-relaxed pt-2">
                {t.bio}
              </p>
            </div>

            {/* Avatar / Profile Graphic */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-[#58a6ff] via-[#bc8cff] to-[#3fb950] shadow-2xl">
                <img
                  src="https://avatars.githubusercontent.com/u/104997092?v=4"
                  alt="Eren Özdemir (KuraPiee)"
                  className="w-32 h-32 sm:w-40 sm:sm:h-40 rounded-full object-cover bg-[#0d1117] border-4 border-[#0d1117]"
                  onError={(e) => {
                    // Fallback to GitHub generated avatar if network blocks
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <a
                  href="https://github.com/KuraPiee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#58a6ff] hover:bg-[#4791eb] text-white transition flex items-center gap-1.5 shadow-md"
                >
                  <Github className="w-3.5 h-3.5" />
                  Follow @KuraPiee
                </a>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-[#30363d]/60 text-center">
            <div className="p-3 rounded-xl bg-[#0d1117]/60 border border-[#30363d]/40">
              <div className="text-2xl font-bold text-white">40+</div>
              <div className="text-xs text-[#8b949e] mt-1">{t.stats.projects}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1117]/60 border border-[#30363d]/40">
              <div className="text-2xl font-bold text-[#58a6ff]">15+</div>
              <div className="text-xs text-[#8b949e] mt-1">{t.stats.repos}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1117]/60 border border-[#30363d]/40">
              <div className="text-2xl font-bold text-[#bc8cff]">6+</div>
              <div className="text-xs text-[#8b949e] mt-1">{t.stats.experience}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1117]/60 border border-[#30363d]/40">
              <div className="text-2xl font-bold text-[#3fb950]">100%</div>
              <div className="text-xs text-[#8b949e] mt-1">Open Source & Ship</div>
            </div>
          </div>
        </section>

        {/* AI & Deep Learning Education Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-7 h-7 text-[#bc8cff]" />
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{t.aiTitle}</h2>
              <p className="text-sm text-[#8b949e]">{t.aiDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#bc8cff]/50 transition group">
              <div className="flex items-center gap-2 text-[#bc8cff] font-semibold text-base mb-2">
                <Cpu className="w-5 h-5" />
                Evrişimsel Sinir Ağları (CNN)
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                {lang === "tr" 
                  ? "Görüntü işleme, özellik haritalama (feature extraction), pooling katmanları ve görsel tanıma mimarileri eğitimi." 
                  : "Convolutional Neural Networks for computer vision, feature extraction, convolutional layers & visual recognition."}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#bc8cff]/50 transition group">
              <div className="flex items-center gap-2 text-[#58a6ff] font-semibold text-base mb-2">
                <Layers className="w-5 h-5" />
                ANN (Yapay Sinir Ağları) & ResNet
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                {lang === "tr" 
                  ? "Feedforward ağlar, backpropagation, artık ağlar (Residual Networks / ResNet) ile vanishing gradient problemine çözüm mimarileri." 
                  : "Artificial Neural Networks, backpropagation, and Deep Residual Learning (ResNet) skip-connection architectures."}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#bc8cff]/50 transition group">
              <div className="flex items-center gap-2 text-[#3fb950] font-semibold text-base mb-2">
                <BookOpen className="w-5 h-5" />
                Doğal Dil İşleme (NLP) & LSTM
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                {lang === "tr" 
                  ? "Metin analizi, tokenization, ardışık veri işleme ve Long Short-Term Memory (LSTM) hücre yapıları eğitimi." 
                  : "Natural Language Processing, text tokenization, sequential data handling & Long Short-Term Memory (LSTM) recurrent units."}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#bc8cff]/50 transition group">
              <div className="flex items-center gap-2 text-[#e3b341] font-semibold text-base mb-2">
                <Zap className="w-5 h-5" />
                TensorFlow & Python AI Stack
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                {lang === "tr" 
                  ? "Model eğitimi, tensör manipülasyonu, loss hesaplamaları, NumPy, Pandas ve Python tabanlı ML pipeline'ları." 
                  : "Deep learning model training, tensor graphs, loss optimization, NumPy, Pandas, and Python ML pipelines."}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#bc8cff]/50 transition group">
              <div className="flex items-center gap-2 text-[#f85149] font-semibold text-base mb-2">
                <Database className="w-5 h-5" />
                OracleSQL & Kurumsal Veri
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                {lang === "tr" 
                  ? "İlişkisel veritabanı modelleme, karmaşık SQL sorguları, indeksleme ve kurumsal veri tabanı yönetimi." 
                  : "Relational database modeling, complex queries, stored procedures, indexing & enterprise OracleSQL management."}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#bc8cff]/50 transition group">
              <div className="flex items-center gap-2 text-[#58a6ff] font-semibold text-base mb-2">
                <Terminal className="w-5 h-5" />
                jQuery & Klasik Web Temelleri
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                {lang === "tr" 
                  ? "13 yaşından beri gelen DOM manipülasyonu, asenkron AJAX akışları ve web standardı temel prensipleri." 
                  : "Classic DOM manipulation, asynchronous AJAX, and rock-solid foundational web standard principles since age 13."}
              </p>
            </div>
          </div>
        </section>

        {/* Technical Proficiency Spectrum */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="w-7 h-7 text-[#58a6ff]" />
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{t.skillsTitle}</h2>
              <p className="text-sm text-[#8b949e]">{t.skillsDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Web & Backend */}
            <div className="p-6 rounded-xl border border-[#30363d] bg-[#161b22] space-y-4">
              <div className="text-base font-bold text-white flex items-center justify-between border-b border-[#30363d] pb-3">
                <span>{t.webTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#238636] text-white font-semibold">Mastered</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["TypeScript", "Node.js", "JavaScript (ES6+)", "PHP", "HTML5 & CSS3", "React & Next.js 15", "Fastify & Express", "Tailwind CSS"].map((s) => (
                  <span key={s} className="px-3 py-1 text-xs font-medium rounded-md bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed pt-2">
                {lang === "tr" 
                  ? "Modern web teknolojilerini baştan sona yalayıp yutmuş seviyede; sıfırdan mimari kurma, SSR, full-stack ve performans optimizasyonu."
                  : "Complete mastery across modern web stacks; zero-latency SSR, full-stack backend development, and high-concurrency systems."}
              </p>
            </div>

            {/* Column 2: Mobile & Systems */}
            <div className="p-6 rounded-xl border border-[#30363d] bg-[#161b22] space-y-4">
              <div className="text-base font-bold text-white flex items-center justify-between border-b border-[#30363d] pb-3">
                <span>{t.mobileTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#1f6feb] text-white font-semibold">Intermediate+</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Flutter (Orta Üstü)", "Dart", "C (Orta)", "C# (Orta)", "Python", "Linux Bash / Shell", "Gömülü Sistemler"].map((s) => (
                  <span key={s} className="px-3 py-1 text-xs font-medium rounded-md bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed pt-2">
                {lang === "tr" 
                  ? "Flutter ile mobil uygulama mimarileri; C ve C# ile düşük seviye bellek ve masaüstü mantığı, elektrik-elektronik ile donanım kontrolü."
                  : "Upper-intermediate Flutter mobile apps; intermediate C & C# for systems thinking, embedded electronics, and desktop services."}
              </p>
            </div>

            {/* Column 3: DB & Infrastructure */}
            <div className="p-6 rounded-xl border border-[#30363d] bg-[#161b22] space-y-4">
              <div className="text-base font-bold text-white flex items-center justify-between border-b border-[#30363d] pb-3">
                <span>{t.dbTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#8957e5] text-white font-semibold">Production</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["PostgreSQL", "MongoDB", "MySQL", "OracleSQL", "Redis", "Docker", "Ubuntu VDS / PM2", "Nginx & SSL"].map((s) => (
                  <span key={s} className="px-3 py-1 text-xs font-medium rounded-md bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed pt-2">
                {lang === "tr" 
                  ? "Canlı sunucu kurulumları, SSL sertifikaları, reverse proxy yapılandırmaları ve ilişkisel/belge tabanlı veri yönetimi."
                  : "Live server orchestration, SSL, reverse proxies, and production database modeling across SQL and NoSQL engines."}
              </p>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="w-7 h-7 text-[#3fb950]" />
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{t.featuredTitle}</h2>
              <p className="text-sm text-[#8b949e]">Üretilen ve aktif çalışan sistemler</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.projects.map((p) => (
              <a
                key={p.name}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff] transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white group-hover:text-[#58a6ff] transition">
                        {p.name}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20 font-semibold">
                        {p.badge}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#8b949e] group-hover:text-white transition" />
                  </div>
                  <p className="text-sm text-[#8b949e] leading-relaxed mb-4">
                    {p.desc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#30363d]/60">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e]">
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="mt-16 pt-8 border-t border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
          <div>
            © {new Date().getFullYear()} <strong className="text-white">Eren Özdemir (KuraPiee)</strong> — Elektrik - Elektronik Teknikeri & Full-Stack Mühendis
          </div>
          <div className="flex items-center gap-4">
            <a href="https://docwyrm.com" className="hover:text-white transition">docwyrm.com</a>
            <a href="https://github.com/KuraPiee" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
            <a href="https://www.npmjs.com/~kurapiee" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">npm</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
