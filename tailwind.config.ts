import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-hanken)', '-apple-system', 'system-ui', 'sans-serif'],
  			serif: ['var(--font-source-serif)', 'Iowan Old Style', 'Georgia', 'serif'],
  		},
  		colors: {
  			/* Mellon raw tokens — use as bg-bg, text-ink, border-line, etc. */
  			bg: 'var(--bg)',
  			'cream-100': 'var(--cream-100)',
  			'cream-200': 'var(--cream-200)',
  			surface: 'var(--surface)',
  			'surface-2': 'var(--surface-2)',
  			'surface-ink': 'var(--surface-ink)',
  			ink: 'var(--ink)',
  			'ink-2': 'var(--ink-2)',
  			'ink-3': 'var(--ink-3)',
  			line: 'var(--line)',
  			'line-strong': 'var(--line-strong)',
  			'primary-soft': 'var(--primary-soft)',
  			'secondary-soft': 'var(--secondary-soft)',
  			'accent-soft': 'var(--accent-soft)',
  			blush: 'var(--blush)',
  			'blush-soft': 'var(--blush-soft)',
  			success: 'var(--success)',
  			'success-soft': 'var(--success-soft)',
  			error: 'var(--error)',
  			'error-soft': 'var(--error-soft)',
  			/* shadcn/ui semantic tokens */
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			/* Mellon: generously rounded — 10 / 16 / 22 / 30 / pill */
  			'2xl': '30px',
  			xl: '30px',
  			lg: '22px',
  			md: '16px',
  			sm: '10px',
  			pill: '999px',
  		},
  		boxShadow: {
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			float: 'var(--shadow-float)',
  			glass: 'var(--glass-shadow)',
  		},
  		backgroundImage: {
  			'cover-green': 'var(--cover-green)',
  			'cover-gold': 'var(--cover-gold)',
  			'cover-blush': 'var(--cover-blush)',
  			'cover-ink': 'var(--cover-ink)',
  			'photo-protect': 'var(--photo-protect)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [],
};
export default config;
