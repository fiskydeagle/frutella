export default {
  modules: ["@nuxt/ui", "@nuxtjs/i18n"],
  buildModules: ["@nuxtjs/date-fns"],
  devtools: { enabled: true },
  css: ["@/assets/css/main.css"],

  i18n: {
    compilation: {
      strictMessage: false,
    },
    strategy: "no_prefix",
    defaultLocale: "al",
    locales: [
      {
        code: "al",
        name: "Shqipe",
        file: "al.yaml",
      },
      {
        code: "en",
        name: "English",
        file: "en.yaml",
      },
    ],
    langDir: "locales",
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: "2024-11-16",
};
