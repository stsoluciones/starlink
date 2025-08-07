/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        'xxs': '320px',    // Extra small devices (phones, 480px and up)
        'xs': '375px',    // Small devices (landscape phones, 640px and up)
        'sm': '425px',    // Medium devices (tablets, 768px and up)
        'md': '768px',    // Medium devices (tablets, 768px and up)
        'lg': '1024px',   // Large devices (desktops, 1024px and up)
        'xl': '1280px',   // Extra large devices (large desktops, 1280px and up)
        '2xl': '1536px',  // 2x extra large devices (larger desktops, 1536px and up)
      },
      colors: {
        primary: {
          DEFAULT: '#F3781B',  // Naranja para un diseño limpio y tecnológico
          hover: '#d86a1c',    // Naranja más oscuro para el efecto hover
          active: '#ce5708',   // Naranja oscuro al hacer clic
          background: '#F5F8FA', // Color de fondo claro y fresco
          background2: '#FFFFFF',
          whats: '#25D366',    // Color para el logo de WhatsApp (verde característico)
          whatsHover: '#20B458' // Un poco más oscuro para hover
        },
        secondary: {
          DEFAULT: '#FFC926',  // Naranja vibrante para atraer la atención
          hover: '#C7391F',    // Un naranja más oscuro al pasar el mouse
          active: '#A0281A',   // O un tono marrón para clic
          background: '#2C2F33' // Color de fondo secundario gris oscuro
        },
        tertiary: {
          DEFAULT: '#5F27CD',  // Un morado que está en tendencia para tecnología
          hover: '#4E1DAC',    // Morado oscuro al pasar el mouse
          active: '#3E1C8B',   // Un matiz más oscuro al hacer clic
        },
        boton: {
          primary: {
            DEFAULT: '#007ACC',  // Manteniéndolo consistente con el color primario
            hover: '#005FA3',
            active: '#004080',
          },
          secondary: {
            DEFAULT: '#E2E2E2',  // Color neutro que combina bien
            hover: '#BDC3C7',    // Color más oscuro para hover
            active: '#95A5A6',   // Un tono gris más oscuro al hacer clic
          }
        },
        text: {
          primary: {
            DEFAULT: '#2C3E50',  // Un azul-gris oscuro para el texto
            title: '#111827',     // Color oscuro para los títulos
            hover: '#2980B9',    // Azul más brillante al pasar el mouse
            active: '#007ACC',   // Match con el color primario
          },
          secondary: {
            DEFAULT: '#7F8C8D',  // Gris intermedio para el texto secundario
            hover: '#34495E',    // Gris más oscuro al pasar el mouse
            active: '#007ACC',   // Match con el color primario
          },
          danger: {
            DEFAULT: '#E74C3C',  // Rojo claro para indicar peligro
            hover: '#C0392B',    // Un rojo más oscuro al pasar el mouse
            active: '#FFFFFF',    // Texto blanco al hacer clic
          }
        }
      },
    },
  },
  plugins: [],
}
