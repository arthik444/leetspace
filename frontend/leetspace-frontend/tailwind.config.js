// tailwind.config.js
export default {
    darkMode: "class",
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          muted: "hsl(var(--muted))",
          "muted-foreground": "hsl(var(--muted-foreground))",
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          primary: "hsl(var(--primary))",
          "primary-foreground": "hsl(var(--primary-foreground))",
          secondary: "hsl(var(--secondary))",
          "secondary-foreground": "hsl(var(--secondary-foreground))",
          accent: "hsl(var(--accent))",
          "accent-foreground": "hsl(var(--accent-foreground))",
          destructive: "hsl(var(--destructive))",
          "destructive-foreground": "hsl(var(--destructive-foreground))",
        },
        borderRadius: {
          lg: "var(--radius)",
        },
      },
    },
    plugins: [],
  }
  