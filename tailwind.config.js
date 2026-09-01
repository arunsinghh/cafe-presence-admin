/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0F",
        surface: "#15151B",
        "surface-hover": "#1F1F28",
        border: "#2A2A35",
        "accent-gold": "#E0B973",
        "accent-green": "#00D26A",
        "accent-red": "#FF4D4F",
        "accent-blue": "#4A90D9",
        "text-primary": "#F5F5F7",
        "text-secondary": "#8E8E93"
      },
      fontFamily: {
        display: [
          "Playfair Display",
          "serif"
        ],
        sans: [
          "Inter",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "monospace"
        ]
      },
      boxShadow: {
        premium: "0px 4px 20px rgba(0,0,0,0.4)"
      },
      borderRadius: {
        card: "16px",
        button: "10px",
        input: "10px",
        badge: "6px"
      }
    }
  },
  plugins: []
};
