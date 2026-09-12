'use client';

import { useState, useEffect, useCallback } from 'react';

export type SupportedLocale = 'en' | 'tr' | 'es' | 'de' | 'fr';

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const TRANSLATIONS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    // Nav & General
    product: 'Product',
    gitEngine: 'Git Engine',
    whyDocwyrm: 'Why Docwyrm',
    marketplace: 'Marketplace',
    pricing: 'Pricing',
    docs: 'Documentation',
    launchStudio: 'Launch Studio',
    startForFree: 'Start for free',
    login: 'Log in',
    signOut: 'Sign Out',
    home: 'Home',
    freeForever: 'Unlimited Community Tier (Free Forever)',
    studioWorkspace: 'Open Studio Workspace',

    // Studio Header
    docBooks: 'Documentation Books',
    freeTierNotice: 'Free Tier: up to 3 independent books',
    used: 'Used',
    createBook: 'Create New Book',
    freeLimitReached: 'Free Tier Maximum Reached (3 of 3 Books Used)',
    read: 'Read',
    edit: 'Edit',
    diff: 'Diff',
    searchPlaceholder: 'Search docs or jump to...',
    gitSynced: 'Git Synced',
    statsButton: 'Analytics & Stats',
    exportButton: 'Export Document',

    // Search & Knowledge Base
    searchDocsTab: 'Full-Text Search',
    knowledgeBaseTab: 'Instant Knowledge Base',
    knowledgeSubtitle: 'In-depth architectural guides & instant answers without external AI fees',
    noResults: 'No documents matching your search query.',
    searchHint: 'Type a query or select a technical guide below',

    // Reader & Feedback
    minRead: 'min read',
    wasHelpful: 'Was this page helpful?',
    yes: 'Yes',
    no: 'No',
    thankFeedback: 'Thanks for your feedback!',
    maintainedBy: 'Maintained by',
    editOnGithub: 'Contribute on GitHub',

    // Analytics Modal
    analyticsTitle: 'Documentation Analytics & Telemetry',
    analyticsSubtitle: '100% self-hosted metrics stored locally. Zero third-party tracking.',
    totalPageViews: 'Total Page Views',
    uniqueReaders: 'Unique Readers',
    helpfulScore: 'Helpful Rating',
    avgReadingTime: 'Avg Reading Time',
    mostReadDocs: 'Most Read Documents',
    liveApiEndpoint: 'Live Self-Hosted REST API',
    close: 'Close',

    // Slash menu
    slashCommandTitle: 'Add MDX Block (Slash Menu)',
    calloutTip: 'Callout Tip (Success)',
    calloutWarn: 'Callout Warning (Caution)',
    calloutImportant: 'Callout Important (Note)',
    codeSandbox: 'Interactive Code Sandbox',
    mermaidDiagram: 'Mermaid Flow Diagram',
    katexMath: 'KaTeX LaTeX Formula',
    markdownTable: 'Structured Table',
  },
  tr: {
    // Nav & General
    product: 'Ürün',
    gitEngine: 'Git Motoru',
    whyDocwyrm: 'Neden Docwyrm',
    marketplace: 'Pazar Yeri',
    pricing: 'Fiyatlandırma',
    docs: 'Dokümantasyon',
    launchStudio: 'Stüdyoyu Başlat',
    startForFree: 'Ücretsiz Başla',
    login: 'Giriş Yap',
    signOut: 'Çıkış Yap',
    home: 'Ana Sayfa',
    freeForever: 'Sınırsız Topluluk Planı (Ömür Boyu Ücretsiz)',
    studioWorkspace: 'Stüdyo Çalışma Alanını Aç',

    // Studio Header
    docBooks: 'Dokümantasyon Kitapları',
    freeTierNotice: 'Ücretsiz Plan: 3 bağımsız kitaba kadar',
    used: 'Kullanılan',
    createBook: 'Yeni Kitap Oluştur',
    freeLimitReached: 'Ücretsiz Plan Sınırına Ulaşıldı (3/3 Kitap Dolu)',
    read: 'Oku',
    edit: 'Düzenle',
    diff: 'Fark (Diff)',
    searchPlaceholder: 'Dökümanlarda ara veya git...',
    gitSynced: 'Git Senkronize',
    statsButton: 'İstatistik & Analitik',
    exportButton: 'Dökümanı Dışa Aktar',

    // Search & Knowledge Base
    searchDocsTab: 'Tam Metin Arama',
    knowledgeBaseTab: 'Hazır Bilgi Bankası',
    knowledgeSubtitle: 'Harici AI maliyeti olmadan derinlemesine mimari ve teknik rehberler',
    noResults: 'Aramanızla eşleşen bir döküman bulunamadı.',
    searchHint: 'Bir terim yazın veya aşağıdaki hazır teknik rehberleri inceleyin',

    // Reader & Feedback
    minRead: 'dk okuma',
    wasHelpful: 'Bu sayfa faydalı oldu mu?',
    yes: 'Evet',
    no: 'Hayır',
    thankFeedback: 'Geri bildiriminiz için teşekkürler!',
    maintainedBy: 'Geliştiren & Yöneten:',
    editOnGithub: "GitHub'da Katkıda Bulun",

    // Analytics Modal
    analyticsTitle: 'Dokümantasyon İstatistik & Analitik Paneli',
    analyticsSubtitle: 'Tamamen yerel depolanan self-hosted metrikler. Sıfır üçüncü taraf takibi.',
    totalPageViews: 'Toplam Görüntülenme',
    uniqueReaders: 'Tekil Okuyucu',
    helpfulScore: 'Faydalılık Oranı',
    avgReadingTime: 'Ort. Okuma Süresi',
    mostReadDocs: 'En Çok Okunan Dökümanlar',
    liveApiEndpoint: 'Canlı Self-Hosted REST API',
    close: 'Kapat',

    // Slash menu
    slashCommandTitle: 'MDX Bloğu Ekle (Slash Menüsü)',
    calloutTip: 'İpucu Kutusu (Yeşil Başarı)',
    calloutWarn: 'Uyarı Kutusu (Sarı Dikkat)',
    calloutImportant: 'Önemli Not Kutusu (Mor Bilgi)',
    codeSandbox: 'Çalıştırılabilir Kod Bloğu',
    mermaidDiagram: 'Mermaid Akış Şeması',
    katexMath: 'KaTeX LaTeX Matematik',
    markdownTable: 'Yapılandırılmış Tablo',
  },
  es: {
    product: 'Producto',
    gitEngine: 'Motor Git',
    whyDocwyrm: 'Por qué Docwyrm',
    marketplace: 'Mercado',
    pricing: 'Precios',
    docs: 'Documentación',
    launchStudio: 'Iniciar Estudio',
    startForFree: 'Empezar gratis',
    login: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
    home: 'Inicio',
    freeForever: 'Nivel Comunidad Ilimitado (Gratis para siempre)',
    studioWorkspace: 'Abrir Espacio de Trabajo',
    docBooks: 'Libros de Documentación',
    freeTierNotice: 'Nivel Gratis: hasta 3 libros independientes',
    used: 'Usados',
    createBook: 'Crear Nuevo Libro',
    freeLimitReached: 'Límite Máximo Alcanzado (3 de 3 libros en uso)',
    read: 'Leer',
    edit: 'Editar',
    diff: 'Diferencias',
    searchPlaceholder: 'Buscar documentos...',
    gitSynced: 'Git Sincronizado',
    statsButton: 'Estadísticas',
    exportButton: 'Exportar Documento',
    searchDocsTab: 'Búsqueda de Texto',
    knowledgeBaseTab: 'Base de Conocimiento',
    knowledgeSubtitle: 'Guías arquitectónicas profundas sin costos de IA externa',
    noResults: 'No se encontraron documentos.',
    searchHint: 'Escriba una consulta o explore las guías técnicas',
    minRead: 'min de lectura',
    wasHelpful: '¿Te resultó útil esta página?',
    yes: 'Sí',
    no: 'No',
    thankFeedback: '¡Gracias por tus comentarios!',
    maintainedBy: 'Mantenido por',
    editOnGithub: 'Contribuir en GitHub',
    analyticsTitle: 'Analítica y Telemetría',
    analyticsSubtitle: 'Métricas 100% autohospedadas almacenadas localmente.',
    totalPageViews: 'Visitas Totales',
    uniqueReaders: 'Lectores Únicos',
    helpfulScore: 'Calificación Útil',
    avgReadingTime: 'Tiempo Medio de Lectura',
    mostReadDocs: 'Documentos Más Leídos',
    liveApiEndpoint: 'API REST en Vivo',
    close: 'Cerrar',
    slashCommandTitle: 'Insertar Bloque MDX',
    calloutTip: 'Consejo Destacado',
    calloutWarn: 'Advertencia',
    calloutImportant: 'Nota Importante',
    codeSandbox: 'Sandbox de Código Ejecutable',
    mermaidDiagram: 'Diagrama Mermaid',
    katexMath: 'Fórmula KaTeX LaTeX',
    markdownTable: 'Tabla Estructurada',
  },
  de: {
    product: 'Produkt',
    gitEngine: 'Git-Engine',
    whyDocwyrm: 'Warum Docwyrm',
    marketplace: 'Marktplatz',
    pricing: 'Preise',
    docs: 'Dokumentation',
    launchStudio: 'Studio Starten',
    startForFree: 'Kostenlos starten',
    login: 'Anmelden',
    signOut: 'Abmelden',
    home: 'Startseite',
    freeForever: 'Unbegrenzte Community-Stufe (Für immer kostenlos)',
    studioWorkspace: 'Studio-Arbeitsbereich öffnen',
    docBooks: 'Dokumentations-Bücher',
    freeTierNotice: 'Kostenlos: bis zu 3 unabhängige Bücher',
    used: 'Verwendet',
    createBook: 'Neues Buch erstellen',
    freeLimitReached: 'Limit erreicht (3 von 3 Büchern genutzt)',
    read: 'Lesen',
    edit: 'Bearbeiten',
    diff: 'Diff',
    searchPlaceholder: 'Dokumentation durchsuchen...',
    gitSynced: 'Git Synchronisiert',
    statsButton: 'Statistiken',
    exportButton: 'Dokument exportieren',
    searchDocsTab: 'Volltextsuche',
    knowledgeBaseTab: 'Wissensdatenbank',
    knowledgeSubtitle: 'Tiefgehende Architekturleitfäden ohne externe KI-Gebühren',
    noResults: 'Keine Dokumente gefunden.',
    searchHint: 'Suchbegriff eingeben oder Leitfaden wählen',
    minRead: 'Min. Lesezeit',
    wasHelpful: 'War diese Seite hilfreich?',
    yes: 'Ja',
    no: 'Nein',
    thankFeedback: 'Vielen Dank für dein Feedback!',
    maintainedBy: 'Verwaltet von',
    editOnGithub: 'Auf GitHub bearbeiten',
    analyticsTitle: 'Dokumentations-Analytik',
    analyticsSubtitle: '100% selbst gehostete Metriken lokal gespeichert.',
    totalPageViews: 'Gesamtaufrufe',
    uniqueReaders: 'Eindeutige Leser',
    helpfulScore: 'Hilfreich-Quote',
    avgReadingTime: 'Durchschn. Lesezeit',
    mostReadDocs: 'Meistgelesene Dokumente',
    liveApiEndpoint: 'Live REST-API',
    close: 'Schließen',
    slashCommandTitle: 'MDX-Block einfügen',
    calloutTip: 'Hinweisfeld (Tipp)',
    calloutWarn: 'Warnhinweis',
    calloutImportant: 'Wichtiger Hinweis',
    codeSandbox: 'Ausführbare Code-Sandbox',
    mermaidDiagram: 'Mermaid-Ablaufdiagramm',
    katexMath: 'KaTeX-Mathematikformel',
    markdownTable: 'Tabelle',
  },
  fr: {
    product: 'Produit',
    gitEngine: 'Moteur Git',
    whyDocwyrm: 'Pourquoi Docwyrm',
    marketplace: 'Marché',
    pricing: 'Tarification',
    docs: 'Documentation',
    launchStudio: 'Lancer le Studio',
    startForFree: 'Commencer gratuitement',
    login: 'Connexion',
    signOut: 'Déconnexion',
    home: 'Accueil',
    freeForever: 'Niveau Communautaire Illimité (Gratuit à vie)',
    studioWorkspace: 'Ouvrir l’Espace Studio',
    docBooks: 'Livres de Documentation',
    freeTierNotice: 'Gratuit : jusqu’à 3 livres indépendants',
    used: 'Utilisés',
    createBook: 'Créer un Nouveau Livre',
    freeLimitReached: 'Limite Atteinte (3 sur 3 livres utilisés)',
    read: 'Lire',
    edit: 'Éditer',
    diff: 'Différences',
    searchPlaceholder: 'Rechercher dans la documentation...',
    gitSynced: 'Git Synchronisé',
    statsButton: 'Statistiques',
    exportButton: 'Exporter le Document',
    searchDocsTab: 'Recherche Plein Texte',
    knowledgeBaseTab: 'Base de Connaissances',
    knowledgeSubtitle: 'Guides architecturaux approfondis sans frais d’IA externe',
    noResults: 'Aucun document trouvé.',
    searchHint: 'Tapez une requête ou parcourez les guides techniques',
    minRead: 'min de lecture',
    wasHelpful: 'Cette page vous a-t-elle été utile ?',
    yes: 'Oui',
    no: 'Non',
    thankFeedback: 'Merci pour vos commentaires !',
    maintainedBy: 'Maintenu par',
    editOnGithub: 'Contribuer sur GitHub',
    analyticsTitle: 'Analytique et Télémétrie',
    analyticsSubtitle: 'Métriques 100% auto-hébergées stockées localement.',
    totalPageViews: 'Vues Totales',
    uniqueReaders: 'Lecteurs Uniques',
    helpfulScore: 'Taux d’Utilité',
    avgReadingTime: 'Temps Moyen de Lecture',
    mostReadDocs: 'Documents les Plus Consultés',
    liveApiEndpoint: 'API REST en Direct',
    close: 'Fermer',
    slashCommandTitle: 'Insérer un Bloc MDX',
    calloutTip: 'Encadré Astuce',
    calloutWarn: 'Avertissement',
    calloutImportant: 'Note Importante',
    codeSandbox: 'Bac à Sable de Code Exécutable',
    mermaidDiagram: 'Diagramme Mermaid',
    katexMath: 'Formule Mathématique KaTeX',
    markdownTable: 'Tableau Structuré',
  },
};

const LANG_KEY = 'docwyrm_lang';

export function getActiveLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(LANG_KEY) as SupportedLocale;
    if (saved && TRANSLATIONS[saved]) return saved;
  } catch (e) {
    console.error(e);
  }
  return 'en';
}

export function setLocale(locale: SupportedLocale) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANG_KEY, locale);
    // Cookie for server/client synchronization
    document.cookie = `docwyrm_lang=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('docwyrm_lang_changed', { detail: locale }));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Reactive i18n hook that guarantees 100% hydration matching (prevents SSR text mismatch)
 * and dynamically re-renders all subscribing components when language changes.
 */
export function useI18n() {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getActiveLocale());
    setMounted(true);

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLocale>;
      if (customEvent.detail && TRANSLATIONS[customEvent.detail]) {
        setLocaleState(customEvent.detail);
      }
    };

    window.addEventListener('docwyrm_lang_changed', handleLangChange);
    return () => window.removeEventListener('docwyrm_lang_changed', handleLangChange);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const active = mounted ? locale : 'en';
      return TRANSLATIONS[active]?.[key] || TRANSLATIONS.en[key] || key;
    },
    [locale, mounted]
  );

  return {
    locale: mounted ? locale : 'en',
    t,
    mounted,
    setLocale,
  };
}
