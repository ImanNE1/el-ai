/**
 * EL Internationalization (i18n)
 * Default Language: Bahasa Indonesia ('id')
 * Supported Languages: Bahasa Indonesia ('id'), English ('en')
 */

export type Language = "id" | "en";

export interface TranslationDictionary {
  common: {
    appName: string;
    gatewaySubtitle: string;
    newChat: string;
    export: string;
    clear: string;
    settings: string;
    done: string;
    delete: string;
    rename: string;
    save: string;
    cancel: string;
    active: string;
    loading: string;
    copy: string;
    copied: string;
    regenerate: string;
    search: string;
    gatewayConnected: string;
  };
  sidebar: {
    title: string;
    newChatBtn: string;
    searchPlaceholder: string;
    noChatsFound: string;
    chatCount: string;
    clearAll: string;
    confirmClearAll: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    yesterday: string;
    daysAgo: string;
    closeSidebar: string;
    openSidebar: string;
  };
  welcome: {
    title: string;
    subtitle: string;
    readyWithGem: string;
  };
  chat: {
    userRole: string;
    assistantRole: string;
    thoughtProcess: string;
    thinking: string;
    synthesizing: string;
    inputPlaceholder: string;
    inputHintEnter: string;
    inputHintShiftEnter: string;
    stopGenerating: string;
    sendMessage: string;
    exportFileNamePrefix: string;
    copy: string;
    copied: string;
    regenerate: string;
  };
  modelSelector: {
    selectModel: string;
    searchPlaceholder: string;
    tabVerified: string;
    tabReasoning: string;
    tabAll: string;
    noModelsFound: string;
    activeBadge: string;
    creditsBadge: string;
  };
  settings: {
    title: string;
    tabAppearance: string;
    tabGems: string;
    tabPersonal: string;
    themeTitle: string;
    themeDesc: string;
    themeDark: string;
    themeDarkSub: string;
    themeLight: string;
    themeLightSub: string;
    languageTitle: string;
    languageDesc: string;
    langId: string;
    langEn: string;
    gemsTitle: string;
    gemsDesc: string;
    gemGeneralName: string;
    gemGeneralDesc: string;
    createGemTitle: string;
    cancelCreateGem: string;
    gemNameLabel: string;
    gemNamePlaceholder: string;
    gemDescLabel: string;
    gemDescPlaceholder: string;
    gemInstructionsLabel: string;
    gemInstructionsPlaceholder: string;
    saveGemBtn: string;
    deleteGemTitle: string;
    personalTitle: string;
    personalDesc: string;
    personalKnowledgeLabel: string;
    personalKnowledgePlaceholder: string;
    responsePreferencesLabel: string;
    responsePreferencesPlaceholder: string;
    doneBtn: string;
  };
  builtInGems: {
    codeArchitect: {
      name: string;
      description: string;
    };
    writingEditor: {
      name: string;
      description: string;
    };
    learningCoach: {
      name: string;
      description: string;
    };
    creativeBrainstormer: {
      name: string;
      description: string;
    };
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  id: {
    common: {
      appName: "EL",
      gatewaySubtitle: "Gateway AI Terpadu & Asisten Cerdas",
      newChat: "Obrolan Baru",
      export: "Ekspor",
      clear: "Bersihkan",
      settings: "Pengaturan",
      done: "Selesai",
      delete: "Hapus",
      rename: "Ubah Nama",
      save: "Simpan",
      cancel: "Batal",
      active: "Aktif",
      loading: "Memuat...",
      copy: "Salin",
      copied: "Tersalin",
      regenerate: "Buat Ulang",
      search: "Cari...",
      gatewayConnected: "Gateway Terhubung",
    },
    sidebar: {
      title: "Percakapan",
      newChatBtn: "Obrolan Baru",
      searchPlaceholder: "Cari riwayat percakapan...",
      noChatsFound: "Tidak ada percakapan ditemukan.",
      chatCount: "{count} percakapan",
      clearAll: "Hapus Semua",
      confirmClearAll: "Hapus semua riwayat percakapan?",
      justNow: "Baru saja",
      minutesAgo: "{m}m yang lalu",
      hoursAgo: "{h}j yang lalu",
      yesterday: "Kemarin",
      daysAgo: "{d}h yang lalu",
      closeSidebar: "Tutup bilah samping",
      openSidebar: "Buka bilah samping",
    },
    welcome: {
      title: "Ada yang bisa saya bantu hari ini?",
      subtitle: "Tanyakan apa saja, rancang arsitektur kode, atau diskusikan ide dengan model terverifikasi berkecepatan tinggi.",
      readyWithGem: "Siap membantu dengan {gem}",
    },
    chat: {
      userRole: "Anda",
      assistantRole: "EL",
      thoughtProcess: "Proses Berpikir",
      thinking: "Sedang berpikir...",
      synthesizing: "Menyusun tanggapan...",
      inputPlaceholder: "Tanyakan apa saja atau minta kode...",
      inputHintEnter: "untuk kirim",
      inputHintShiftEnter: "untuk baris baru",
      stopGenerating: "Hentikan pembuatan",
      sendMessage: "Kirim pesan",
      exportFileNamePrefix: "el-obrolan",
      copy: "Salin",
      copied: "Tersalin",
      regenerate: "Buat Ulang",
    },
    modelSelector: {
      selectModel: "Pilih Model",
      searchPlaceholder: "Cari model...",
      tabVerified: "Terverifikasi Aktif",
      tabReasoning: "Penalaran",
      tabAll: "Semua ({count})",
      noModelsFound: "Model tidak ditemukan.",
      activeBadge: "Aktif",
      creditsBadge: "Kredit",
    },
    settings: {
      title: "Pengaturan & Preferensi",
      tabAppearance: "Tampilan",
      tabGems: "Gem Skill",
      tabPersonal: "Instruksi Pribadi",
      themeTitle: "Mode Tema",
      themeDesc: "Pilih preferensi tema visual untuk antarmuka asisten.",
      themeDark: "Mode Gelap",
      themeDarkSub: "Glassmorphism elegan dengan kontras tinggi",
      themeLight: "Mode Terang (Bawaan)",
      themeLightSub: "Palet cerah yang jernih dan nyaman",
      languageTitle: "Bahasa Antarmuka",
      languageDesc: "Pilih bahasa tampilan untuk aplikasi.",
      langId: "Bahasa Indonesia (Bawaan)",
      langEn: "English",
      gemsTitle: "Gem Skill",
      gemsDesc: "Peran khusus yang disesuaikan untuk tugas, alur kerja, dan keahlian spesifik.",
      gemGeneralName: "Umum (Bawaan)",
      gemGeneralDesc: "Asisten serba guna yang bijak untuk semua tugas tanpa batasan peran.",
      createGemTitle: "+ Buat Gem Skill Anda Sendiri",
      cancelCreateGem: "Batal Buat Gem",
      gemNameLabel: "Nama Gem",
      gemNamePlaceholder: "cth. Mentor Next.js, Pengoptimal SQL, Asisten Pribadi",
      gemDescLabel: "Deskripsi Singkat",
      gemDescPlaceholder: "Ringkasan singkat fungsi Gem ini",
      gemInstructionsLabel: "Instruksi Khusus Gem",
      gemInstructionsPlaceholder: "Tentukan bagaimana Gem ini harus berpikir, bertindak, dan menjawab...",
      saveGemBtn: "Simpan & Aktifkan Gem",
      deleteGemTitle: "Hapus Gem kustom",
      personalTitle: "Konteks & Preferensi Pribadi",
      personalDesc: "Berikan informasi agar EL mengenali Anda dan selalu menyesuaikan jawaban dengan preferensi Anda.",
      personalKnowledgeLabel: "Apa yang ingin Anda beritahukan kepada EL tentang diri Anda?",
      personalKnowledgePlaceholder: "cth. Saya seorang pengembang perangkat lunak yang membangun aplikasi TypeScript dan Next.js. Lebih menyukai pola modern.",
      responsePreferencesLabel: "Bagaimana Anda ingin EL memberikan tanggapan?",
      responsePreferencesPlaceholder: "cth. Berikan penjelasan lugas, ringkas, dan sertakan contoh kode jika relevan. Gunakan Bahasa Indonesia yang baik.",
      doneBtn: "Selesai",
    },
    builtInGems: {
      codeArchitect: {
        name: "Code Architect",
        description: "Pengembang senior yang berfokus pada kode bersih, keamanan tipe, dan arsitektur modular.",
      },
      writingEditor: {
        name: "Writing & Editor",
        description: "Editor profesional yang memoles tulisan, mempertajam kejelasan, dan memangkas kata-kata berlebihan.",
      },
      learningCoach: {
        name: "Learning Coach",
        description: "Mentor sabar yang menggunakan analogi intuitif dan teknik Feynman untuk mempermudah pemahaman.",
      },
      creativeBrainstormer: {
        name: "Creative Brainstormer",
        description: "Strategis kreatif yang menghasilkan konsep inovatif dan sudut pandang pemecahan masalah baru.",
      },
    },
  },
  en: {
    common: {
      appName: "EL",
      gatewaySubtitle: "Unified AI Gateway & Assistant",
      newChat: "New Chat",
      export: "Export",
      clear: "Clear",
      settings: "Settings",
      done: "Done",
      delete: "Delete",
      rename: "Rename",
      save: "Save",
      cancel: "Cancel",
      active: "Active",
      loading: "Loading...",
      copy: "Copy",
      copied: "Copied",
      regenerate: "Regenerate",
      search: "Search...",
      gatewayConnected: "Gateway Connected",
    },
    sidebar: {
      title: "Conversations",
      newChatBtn: "New Chat",
      searchPlaceholder: "Search history...",
      noChatsFound: "No conversations found.",
      chatCount: "{count} chats",
      clearAll: "Clear All",
      confirmClearAll: "Clear all conversation history?",
      justNow: "Just now",
      minutesAgo: "{m}m ago",
      hoursAgo: "{h}h ago",
      yesterday: "Yesterday",
      daysAgo: "{d}d ago",
      closeSidebar: "Close sidebar",
      openSidebar: "Open sidebar",
    },
    welcome: {
      title: "How can I help you today?",
      subtitle: "Ask anything, request code architecture, or brainstorm ideas with verified high-performance models.",
      readyWithGem: "Ready with {gem}",
    },
    chat: {
      userRole: "You",
      assistantRole: "EL",
      thoughtProcess: "Thought process",
      thinking: "Thinking...",
      synthesizing: "Synthesizing response...",
      inputPlaceholder: "Ask anything or request code...",
      inputHintEnter: "to send",
      inputHintShiftEnter: "for new line",
      stopGenerating: "Stop generating",
      sendMessage: "Send message",
      exportFileNamePrefix: "el-chat",
      copy: "Copy",
      copied: "Copied",
      regenerate: "Regenerate",
    },
    modelSelector: {
      selectModel: "Select Model",
      searchPlaceholder: "Search models...",
      tabVerified: "Verified Active",
      tabReasoning: "Reasoning",
      tabAll: "All ({count})",
      noModelsFound: "No matching models found.",
      activeBadge: "Active",
      creditsBadge: "Credits",
    },
    settings: {
      title: "Settings & Preferences",
      tabAppearance: "Appearance",
      tabGems: "Gem Skills",
      tabPersonal: "Personal Instructions",
      themeTitle: "Theme Mode",
      themeDesc: "Choose your preferred visual theme for the assistant interface.",
      themeDark: "Dark Mode",
      themeDarkSub: "Sleek glassmorphism with high contrast",
      themeLight: "Light Mode (Default)",
      themeLightSub: "Crisp, soft bright daytime palette",
      languageTitle: "Interface Language",
      languageDesc: "Choose the language for the application interface.",
      langId: "Bahasa Indonesia (Default)",
      langEn: "English",
      gemsTitle: "Gem Skills",
      gemsDesc: "Specialized roles tailored for specific tasks, workflows, and expertise.",
      gemGeneralName: "General (Default)",
      gemGeneralDesc: "General-purpose thoughtful assistant without specialized role constraints.",
      createGemTitle: "+ Create Your Own Gem Skill",
      cancelCreateGem: "Cancel Custom Gem",
      gemNameLabel: "Gem Name",
      gemNamePlaceholder: "e.g. Next.js Mentor, SQL Optimizer, Personal Assistant",
      gemDescLabel: "Short Description",
      gemDescPlaceholder: "Brief summary of what this Gem does",
      gemInstructionsLabel: "Custom Skill Instructions",
      gemInstructionsPlaceholder: "Specify exactly how this Gem should think, act, format answers, and solve problems...",
      saveGemBtn: "Save & Activate Gem",
      deleteGemTitle: "Delete custom Gem",
      personalTitle: "Personal Context & Preferences",
      personalDesc: "Provide persistent information so EL knows about you and always formats answers to your taste.",
      personalKnowledgeLabel: "What would you like EL to know about you?",
      personalKnowledgePlaceholder: "e.g. I am a software engineer building TypeScript and Next.js applications. Prefer modern, idiomatic patterns.",
      responsePreferencesLabel: "How would you like EL to respond?",
      responsePreferencesPlaceholder: "e.g. Keep explanations direct, concise, and grounded with code snippets. Prefer Bahasa Indonesia or English.",
      doneBtn: "Done",
    },
    builtInGems: {
      codeArchitect: {
        name: "Code Architect",
        description: "Senior developer focused on clean code, type safety, modular design, and robust architecture.",
      },
      writingEditor: {
        name: "Writing & Editor",
        description: "Copywriter and editor who polishes prose, sharpens clarity, and eliminates fluff.",
      },
      learningCoach: {
        name: "Learning Coach",
        description: "Patient mentor using the Feynman technique, intuitive analogies, and step-by-step guidance.",
      },
      creativeBrainstormer: {
        name: "Creative Brainstormer",
        description: "Generates novel concepts, lateral connections, and innovative problem-solving angles.",
      },
    },
  },
};
