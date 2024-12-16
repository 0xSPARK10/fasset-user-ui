import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            lineHeight: {
                11: '3rem'
            },
            fontSize: {
                '10': ['0.625rem', '0.875rem'],
                '11': ['0.688rem', '0.875rem'],
                '12': ['0.75rem', '1rem'],
                '14': ['0.875rem', '1.125rem'],
                '15': ['0.938rem', '1.25rem'],
                '16': ['1rem', '1.375rem'],
                '18': ['1.125rem', '1.5rem'],
                '20': ['1.25rem', '1.75rem'],
                '24': ['1.5rem', '2.25rem'],
                '26': ['1.625rem', '2.25rem'],
                '28': ['1.75rem', '2.375rem'],
                '32': ['2rem', '2.75rem'],
                '48': ['3rem', '4.125rem'],
                '80': ['5rem', '6.875rem'],
            }
        },
    },
    plugins: [],
};
export default config;
