// Framework options and their defaults
export const FRAMEWORKS = [
  {
    label: "React (CRA)",
    value: "react",
    icon: "⚛️",
    buildCommand: "npm run build",
    outputFolder: "build",
  },
  {
    label: "Vite",
    value: "vite",
    icon: "⚡",
    buildCommand: "npm run build",
    outputFolder: "dist",
  },
  {
    label: "Vue.js",
    value: "vue",
    icon: "💚",
    buildCommand: "npm run build",
    outputFolder: "dist",
  },
  {
    label: "Angular",
    value: "angular",
    icon: "🅰️",
    buildCommand: "ng build --configuration production",
    outputFolder: "dist",
  },
  {
    label: "Next.js",
    value: "nextjs",
    icon: "▲",
    buildCommand: "npm run build",
    outputFolder: ".next",
  },
  {
    label: "Svelte",
    value: "svelte",
    icon: "🧡",
    buildCommand: "npm run build",
    outputFolder: "dist",
  },
  {
    label: "Nuxt.js",
    value: "nuxt",
    icon: "💚",
    buildCommand: "npm run generate",
    outputFolder: "dist",
  },
  {
    label: "SvelteKit",
    value: "sveltekit",
    icon: "🧡",
    buildCommand: "npm run build",
    outputFolder: "build",
  },
  {
    label: "Astro",
    value: "astro",
    icon: "🚀",
    buildCommand: "npm run build",
    outputFolder: "dist",
  },
  {
    label: "Remix",
    value: "remix",
    icon: "🎸",
    buildCommand: "npm run build",
    outputFolder: "build",
  },
  {
    label: "Custom",
    value: "custom",
    icon: "⚙️",
    buildCommand: "",
    outputFolder: "",
  },
];

export default FRAMEWORKS;
