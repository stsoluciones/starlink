import userData from "./userData";

export const infoWeb = {
    title:'Computadoras, Mini Pc, nuc,  mantenimientos de consolas y Fuente adaptador de STARLINK mini.',
    subtitle: 'Consulta por Whatsapp el producto que necesitas, somos de Wilde, Buenos Aires',
    contact:1136317470,
    codigoPais:54,
    sobremi:`<strong class="text-text-danger font-bold">${userData.name}</strong>, es una Startup joven que nos dedicamos a la venta de insumos informaticos, trabajamos por whatsapp para entregas en persona y mercadoshops para quienes quieren envios.`,
};

export const faqData = [
  {
    id: 1,
    question: "¿Sirve para viajes largos?",
    answer: "Si se puede usar varios dias conectado sin problema.",
  },
  {
    id: 2,
    question: "¿Cuanto consume?",
    answer:"El cable en si mismo no consume nada la antena consume en promedio 30w (3 amperes).",
  },
  {
    id: 3,
    question: "¿Incluye el cable para conectar a la antena?",
    answer:"Si incluye 4 mtr de cable.",
    linkText: "Ver ubicación en el mapa",
    linkUrl: "http://localhost:3000.com/#nosotros"
  },
  {
    id: 4,
    question: "¿La ficha es impermeable como la original ?",
    answer: "Sí, la ficha trae sello contra agua y polvo",
    linkText: "Consulta nuestras opciones de envío",
    linkUrl: "http://localhost:3000.com/envios"
  },
  
];

export const shippingOptions = [
  {
    id: 1,
    name: "Envío Estándar",
    description: "Entrega en 7 días hábiles en todo el país.",
    cost: "Gratis en compras superiores a $50000.",
    icon: "",
  },
  {
    id: 2,
    name: "Envío Express",
    description: "Entrega en 5 días hábiles para mayor rapidez.",
    cost: "",
    icon: "",
  },
  {
    id: 3,
    name: "Retiro en Wilde",
    description: "Recoge tu pedido en wilde sin costo de envío.",
    cost: "Sin costo adicional.",
    icon: "",
  }
];