/**
 * Agency Landing Page Translations (Bilingual: ID & EN)
 * Inspired by Swiss Editorial Design & Linear/Vercel Aesthetics
 */

export interface AgencyTranslations {
  meta: {
    brandName: string;
    tagline: string;
    systemStatus: string;
    syncedTime: string;
  };
  nav: {
    capabilities: string;
    methodology: string;
    caseStudies: string;
    systemData: string;
    aiStudio: string;
    sendBrief: string;
    lang: string;
  };
  hero: {
    badge: string;
    headlinePart1: string;
    headlinePart2: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    aiCta: string;
    liveTicker: {
      activeEngine: string;
      medianRoi: string;
      attributionRate: string;
      latency: string;
    };
  };
  valueProps: {
    sectionIndex: string;
    sectionTitle: string;
    sectionSubtitle: string;
    items: Array<{
      index: string;
      title: string;
      description: string;
      status: "scale" | "active" | "optimized";
      statusLabel: string;
      metric: string;
      metricLabel: string;
    }>;
  };
  caseStudies: {
    sectionIndex: string;
    sectionTitle: string;
    sectionSubtitle: string;
    filterAll: string;
    filterEnterprise: string;
    filterFintech: string;
    filterAi: string;
    items: Array<{
      id: string;
      brand: string;
      category: string;
      title: string;
      description: string;
      metric: string;
      metricLabel: string;
      status: "scale" | "hold" | "active";
      statusText: string;
      tags: string[];
      year: string;
    }>;
  };
  liveMatrix: {
    sectionIndex: string;
    sectionTitle: string;
    sectionSubtitle: string;
    colChannel: string;
    colStatus: string;
    colSpend: string;
    colRoas: string;
    colSentiment: string;
    colAction: string;
  };
  briefModal: {
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    company: string;
    budget: string;
    budgetTiers: string[];
    scope: string;
    scopeOptions: string[];
    details: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    close: string;
  };
  footer: {
    tagline: string;
    rights: string;
    locations: { city: string; timeZone: string }[];
  };
}

export const agencyTranslations: Record<"en" | "id", AgencyTranslations> = {
  en: {
    meta: {
      brandName: "EL / STUDIO",
      tagline: "Creative & Marketing Tech",
      systemStatus: "OPERATIONAL · SCALE",
      syncedTime: "Synced 07:15 UTC",
    },
    nav: {
      capabilities: "Capabilities",
      methodology: "Methodology",
      caseStudies: "Case Studies",
      systemData: "Live System",
      aiStudio: "AI Gateway",
      sendBrief: "Send a brief →",
      lang: "EN",
    },
    hero: {
      badge: "GLOBAL CREATIVE & MEDIA ENGINE",
      headlinePart1: "Closing the loop between creative strategy",
      headlinePart2: "and measurable algorithmic performance.",
      subheadline:
        "We engineer high-fidelity creative systems, quantitative brand architectures, and deterministic media pipelines for category-defining technology enterprises.",
      primaryCta: "Send a brief →",
      secondaryCta: "Explore Case Studies ↓",
      aiCta: "Launch AI Studio ↗",
      liveTicker: {
        activeEngine: "$142M+ Capital Deployed",
        medianRoi: "7.4× Median ROAS",
        attributionRate: "99.4% Attribution Precision",
        latency: "14ms Pipeline Latency",
      },
    },
    valueProps: {
      sectionIndex: "01 // VALUE PROPOSITIONS",
      sectionTitle: "Architectural Principles",
      sectionSubtitle:
        "Four uncompromising pillars designed to out-execute conventional creative agencies and legacy media buyers.",
      items: [
        {
          index: "01",
          title: "Algorithmic Creative Engine",
          description:
            "High-tempo modular creative generation where visual assets, copywriting variants, and motion design mutate dynamically based on audience micro-signals.",
          status: "scale",
          statusLabel: "SCALE / ACTIVE",
          metric: "1,200+",
          metricLabel: "Variants Tested / Mo",
        },
        {
          index: "02",
          title: "Predictive Audience Modeling",
          description:
            "Proprietary first-party intent graphs and neural attribution models that bypass cookie deprecation to capture enterprise decision-makers at scale.",
          status: "scale",
          statusLabel: "VERIFIED",
          metric: "91.8%",
          metricLabel: "Intent Correlation",
        },
        {
          index: "03",
          title: "Deterministic Attribution",
          description:
            "Zero blended-metric illusions. Every campaign dollar is reconciled against CRM revenue pipelines, incremental pipeline velocity, and LTV cohorts.",
          status: "scale",
          statusLabel: "AUDITED",
          metric: "99.4%",
          metricLabel: "Reconciliation",
        },
        {
          index: "04",
          title: "Zero-Latency Iteration Loop",
          description:
            "Creative feedback loops compressed from 3 weeks to 18 hours. Real-time telemetry signals instruct creative production teams in continuous sprints.",
          status: "scale",
          statusLabel: "AUTONOMOUS",
          metric: "< 18h",
          metricLabel: "Feedback Cycle",
        },
      ],
    },
    caseStudies: {
      sectionIndex: "02 // VERIFIED CASE STUDIES",
      sectionTitle: "Capital Efficiency in Production",
      sectionSubtitle:
        "Recent performance deployments across sovereign AI platforms, global enterprise SaaS, and high-velocity fintech.",
      filterAll: "All Deployments",
      filterEnterprise: "Enterprise SaaS",
      filterFintech: "Fintech",
      filterAi: "AI & DeepTech",
      items: [
        {
          id: "cs-1",
          brand: "KRONOS CLOUD",
          category: "Enterprise SaaS",
          title: "Global Enterprise Category Repositioning & Pipeline Expansion",
          description:
            "Executed full-funnel positioning sprint and multi-market programmatic creative deployment targeting Fortune 500 VP Infrastructure leaders.",
          metric: "300% growth",
          metricLabel: "Pipeline Acceleration",
          status: "scale",
          statusText: "SCALE",
          tags: ["Enterprise SaaS", "B2B Brand Tech", "Multi-Touch"],
          year: "2026",
        },
        {
          id: "cs-2",
          brand: "VALENCE HEALTH",
          category: "Fintech",
          title: "Algorithmic Acquisition Architecture & Underwriting Funnel",
          description:
            "Re-engineered conversion choreography with generative dynamic landing pages and localized regulatory-compliant ad creative variants.",
          metric: "7× ROI",
          metricLabel: "Deterministic Revenue Yield",
          status: "scale",
          statusText: "SCALE",
          tags: ["Health Tech", "Dynamic Creative", "99.2% Attribution"],
          year: "2026",
        },
        {
          id: "cs-3",
          brand: "AURA ROBOTICS",
          category: "AI & DeepTech",
          title: "Autonomous Developer Adoption & Global Category Leadership",
          description:
            "Omnichannel technical content syndication and synthetic benchmark visual assets engineered for industrial robotics decision-makers.",
          metric: "82% positive sentiment",
          metricLabel: "Unprompted Brand Affinity",
          status: "scale",
          statusText: "SCALE",
          tags: ["Industrial AI", "Technical Motion", "Developer Funnel"],
          year: "2025",
        },
        {
          id: "cs-4",
          brand: "NEURA MOBILITY",
          category: "AI & DeepTech",
          title: "Pre-IPO Narrative Infrastructure & Capital Acquisition Campaign",
          description:
            "Architected high-contrast Swiss editorial investor presentations, microsites, and targeted algorithmic executive media buy.",
          metric: "$48M ARR",
          metricLabel: "Attributed Contract Value",
          status: "hold",
          statusText: "HOLD",
          tags: ["Autonomous Transit", "Investor Tech", "Direct Pipeline"],
          year: "2025",
        },
      ],
    },
    liveMatrix: {
      sectionIndex: "03 // TELEMETRY & ATTRIBUTION",
      sectionTitle: "Algorithmic Media Live Matrix",
      sectionSubtitle:
        "Direct telemetry from production deployment clusters. Real-time capital allocation across global programmatic environments.",
      colChannel: "Channel Cluster",
      colStatus: "Pacing Status",
      colSpend: "Allocated Spend",
      colRoas: "Blended Yield",
      colSentiment: "Audience Sentiment",
      colAction: "Engine Vector",
    },
    briefModal: {
      title: "Initiate Engagement",
      subtitle:
        "Provide your strategic parameters. Our technical directors respond with an architectural blueprint within 24 hours.",
      fullName: "Full Name",
      email: "Work Email",
      company: "Organization / Company",
      budget: "Quarterly Media & Creative Budget",
      budgetTiers: [
        "$25,000 — $50,000",
        "$50,000 — $150,000",
        "$150,000 — $500,000",
        "$500,000+",
      ],
      scope: "Primary Strategic Scope",
      scopeOptions: [
        "Full-Funnel Algorithmic Growth",
        "Brand Repositioning & Design Systems",
        "Generative Creative Production Pipeline",
        "Attribution Architecture & Data Re-engineering",
      ],
      details: "Project Parameters & Target KPI",
      submit: "Transmit Brief →",
      submitting: "Transmitting telemetry...",
      successTitle: "Brief Received & Reconciled",
      successMessage:
        "Your brief has been logged to our active queue. Technical director assigned: D. Vance (Zurich Studio).",
      close: "Dismiss",
    },
    footer: {
      tagline:
        "EL / STUDIO — Sovereign Creative Strategy & Algorithmic Media Architecture.",
      rights: "All rights reserved. Zurich · Singapore · San Francisco.",
      locations: [
        { city: "Zurich", timeZone: "Europe/Zurich" },
        { city: "Singapore", timeZone: "Asia/Singapore" },
        { city: "San Francisco", timeZone: "America/Los_Angeles" },
      ],
    },
  },

  id: {
    meta: {
      brandName: "EL / STUDIO",
      tagline: "Teknologi Kreatif & Pemasaran",
      systemStatus: "BEROPERASI · AKTIF",
      syncedTime: "Tersinkronisasi 07:15 UTC",
    },
    nav: {
      capabilities: "Kapabilitas",
      methodology: "Metodologi",
      caseStudies: "Studi Kasus",
      systemData: "Sistem Langsung",
      aiStudio: "Gateway AI",
      sendBrief: "Kirim brief →",
      lang: "ID",
    },
    hero: {
      badge: "MESIN MEDIA & KREATIF GLOBAL",
      headlinePart1: "Menghubungkan strategi kreatif",
      headlinePart2: "dan performa algoritmik yang terukur.",
      subheadline:
        "Kami merancang arsitektur merek kuantitatif, sistem visual berpresisi tinggi, dan saluran media deterministik untuk perusahaan teknologi terdepan.",
      primaryCta: "Kirim brief →",
      secondaryCta: "Telusuri Studi Kasus ↓",
      aiCta: "Buka AI Studio ↗",
      liveTicker: {
        activeEngine: "$142M+ Modal Dikelola",
        medianRoi: "7.4× Rata-rata ROAS",
        attributionRate: "99.4% Presisi Atribusi",
        latency: "14ms Latensi Alur",
      },
    },
    valueProps: {
      sectionIndex: "01 // PROPOSISI NILAI",
      sectionTitle: "Prinsip Arsitektur Kami",
      sectionSubtitle:
        "Empat pilar tanpa kompromi yang dirancang untuk mengungguli agensi kreatif konvensional dan biro media warisan.",
      items: [
        {
          index: "01",
          title: "Mesin Kreatif Algoritmik",
          description:
            "Produksi materi iklan modular berkecepatan tinggi di mana varian visual, naskah, dan motion bermutasi secara dinamis berdasarkan sinyal mikro audiens.",
          status: "scale",
          statusLabel: "SKALA / AKTIF",
          metric: "1.200+",
          metricLabel: "Varian Diuji / Bln",
        },
        {
          index: "02",
          title: "Pemodelan Audiens Prediktif",
          description:
            "Grafik intensi data pihak pertama dan model atribusi neural yang melompati era penghapusan cookie untuk menjangkau pengambil keputusan enterprise.",
          status: "scale",
          statusLabel: "TERVERIFIKASI",
          metric: "91.8%",
          metricLabel: "Korelasi Intensi",
        },
        {
          index: "03",
          title: "Atribusi Pendapatan Deterministik",
          description:
            "Tanpa ilusi metrik semu. Setiap rupiah belanja iklan direkonsiliasi langsung dengan pendapatan CRM, pipeline velocity, dan kohort LTV riil.",
          status: "scale",
          statusLabel: "TERAUDIT",
          metric: "99.4%",
          metricLabel: "Rekonsiliasi Riil",
        },
        {
          index: "04",
          title: "Siklus Iterasi Nol-Latensi",
          description:
            "Siklus umpan balik kreatif dipangkas dari 3 minggu menjadi 18 jam. Data telemetri real-time memandu sprint produksi kreatif tanpa jeda.",
          status: "scale",
          statusLabel: "OTONOM",
          metric: "< 18j",
          metricLabel: "Siklus Umpan Balik",
        },
      ],
    },
    caseStudies: {
      sectionIndex: "02 // STUDI KASUS TERVERIFIKASI",
      sectionTitle: "Efisiensi Modal dalam Produksi",
      sectionSubtitle:
        "Implementasi performa terkini di seluruh platform AI berdaulat, enterprise SaaS global, dan fintech berkecepatan tinggi.",
      filterAll: "Semua Proyek",
      filterEnterprise: "Enterprise SaaS",
      filterFintech: "Fintech",
      filterAi: "AI & DeepTech",
      items: [
        {
          id: "cs-1",
          brand: "KRONOS CLOUD",
          category: "Enterprise SaaS",
          title: "Reposisi Kategori Enterprise Global & Ekspansi Pipeline",
          description:
            "Menjalankan sprint positioning komprehensif dan peluncuran materi kreatif programatik multi-pasar yang menyasar VP Infrastruktur Fortune 500.",
          metric: "300% growth",
          metricLabel: "Akselerasi Pipeline",
          status: "scale",
          statusText: "SCALE",
          tags: ["Enterprise SaaS", "B2B Brand Tech", "Multi-Touch"],
          year: "2026",
        },
        {
          id: "cs-2",
          brand: "VALENCE HEALTH",
          category: "Fintech",
          title: "Arsitektur Akuisisi Algoritmik & Corong Penjaminan",
          description:
            "Merekayasa konversi landing page dinamis generatif dan varian materi iklan dengan kepatuhan regulasi terotomasi.",
          metric: "7× ROI",
          metricLabel: "Imbal Hasil Pendapatan Deterministik",
          status: "scale",
          statusText: "SCALE",
          tags: ["Health Tech", "Dynamic Creative", "99.2% Atribusi"],
          year: "2026",
        },
        {
          id: "cs-3",
          brand: "AURA ROBOTICS",
          category: "AI & DeepTech",
          title: "Adopsi Pengembang Otonom & Kepemimpinan Kategori Global",
          description:
            "Sindikasi konten teknis omnichannel dan aset visual tolok ukur sintetis yang dirancang untuk pengambil keputusan robotika industri.",
          metric: "82% positive sentiment",
          metricLabel: "Afinitas Merek Spontan",
          status: "scale",
          statusText: "SCALE",
          tags: ["Industrial AI", "Technical Motion", "Developer Funnel"],
          year: "2025",
        },
        {
          id: "cs-4",
          brand: "NEURA MOBILITY",
          category: "AI & DeepTech",
          title: "Infrastruktur Narasi Pra-IPO & Kampanye Akuisisi Modal",
          description:
            "Merancang materi presentasi investor bergaya Swiss Editorial, microsite performa tinggi, dan penempatan media eksekutif berpresisi.",
          metric: "$48M ARR",
          metricLabel: "Nilai Kontrak Teratribusi",
          status: "hold",
          statusText: "HOLD",
          tags: ["Transit Otonom", "Investor Tech", "Pipeline Langsung"],
          year: "2025",
        },
      ],
    },
    liveMatrix: {
      sectionIndex: "03 // TELEMETRI & ATRIBUSI",
      sectionTitle: "Matriks Media Algoritmik Langsung",
      sectionSubtitle:
        "Telemetri langsung dari kluster penyebaran produksi. Alokasi modal waktu nyata di seluruh lanskap programatik global.",
      colChannel: "Kluster Saluran",
      colStatus: "Status Pacing",
      colSpend: "Belanja Dialokasikan",
      colRoas: "Hasil Terpadu",
      colSentiment: "Sentimen Audiens",
      colAction: "Vektor Mesin",
    },
    briefModal: {
      title: "Mulai Kolaborasi",
      subtitle:
        "Sampaikan parameter strategis Anda. Technical Director kami akan membalas dengan cetak biru arsitektur dalam 24 jam.",
      fullName: "Nama Lengkap",
      email: "Email Kerja",
      company: "Organisasi / Perusahaan",
      budget: "Anggaran Kuartalan Kreatif & Media",
      budgetTiers: [
        "$25.000 — $50.000 (Rp400jt - Rp800jt)",
        "$50.000 — $150.000 (Rp800jt - Rp2,4M)",
        "$150.000 — $500.000 (Rp2,4M - Rp8M)",
        "$500.000+ (Di atas Rp8M)",
      ],
      scope: "Cakupan Strategis Utama",
      scopeOptions: [
        "Pertumbuhan Algoritmik Full-Funnel",
        "Reposisi Merek & Sistem Desain",
        "Alur Produksi Kreatif Generatif",
        "Arsitektur Atribusi & Rekayasa Data",
      ],
      details: "Parameter Proyek & Target KPI",
      submit: "Kirim Brief →",
      submitting: "Mentransmisikan telemetri...",
      successTitle: "Brief Berhasil Diterima & Direkonsiliasi",
      successMessage:
        "Brief Anda telah dicatat dalam antrean aktif kami. Technical Director yang ditugaskan: D. Vance (Studio Zurich).",
      close: "Tutup",
    },
    footer: {
      tagline:
        "EL / STUDIO — Strategi Kreatif Berdaulat & Arsitektur Media Algoritmik.",
      rights: "Hak cipta dilindungi. Zurich · Singapura · San Francisco.",
      locations: [
        { city: "Zurich", timeZone: "Europe/Zurich" },
        { city: "Singapura", timeZone: "Asia/Singapore" },
        { city: "San Francisco", timeZone: "America/Los_Angeles" },
      ],
    },
  },
};
