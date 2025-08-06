import userData from "./userData";

export const infoWeb = {
    title:'Computadoras, Mini Pc, nuc,  mantenimientos de consolas y Fuente adaptador de STARLINK mini.',
    subtitle: 'Consulta por Whatsapp el producto que necesitas, somos de Wilde, Buenos Aires',
    contact:1136317470,
    codigoPais:54,
    sobremi:`<strong class="text-text-danger font-bold">${userData.name}</strong>, es una Startup joven que nos dedicamos a la venta de insumos informaticos, trabajamos por whatsapp para entregas en persona y mercadoshops para quienes quieren envíos  .`,
};

export const faqData = [
  {
    id: 1,
    question: "¿Puedo conectar mi antena Starlink Mini al encendedor del auto de 12 V?",
    answer: "Sí. Con el adaptador elevador SL1230 de SL Soluciones podés conectar tu antena a cualquier toma tipo encendedor de 12 V o 24 V. Este adaptador eleva la tensión a 35 V, permitiendo que la antena funcione de manera estable, sin interrupciones y sin recalentar durante largos viajes.",
  },
  {
    id: 2,
    question: "¿Puedo conectar mi antena Starlink Mini directo a 12 V de la batería de mi vehículo?",
    answer:" Sí. Con el adaptador elevador SL1230 de SL Soluciones podés conectarla directo a la batería de 12 V o 24 V, ya que este adaptador eleva la tensión a 35 V, garantizando que la antena funcione de manera estable y sin inconvenientes.",
  },
  {
    id: 3,
    question: "¿Por qué mi antena Starlink Mini no funciona bien conectada al auto?",
    answer:" Para que funcione correctamente necesitás colocar un elevador de tensión. El módulo SL1230 de SL Soluciones eleva la tensión a 35 V, asegurando que la antena funcione sin problemas, de manera estable y segura.",
  },
  {
    id: 4,
    question: "¿Puedo conectar mi antena Starlink Mini a mis paneles solares?",
    answer: "Sí. Para conectar tu antena a un sistema de paneles solares podés usar el módulo SL1230BAT o SL1230 de SL Soluciones. Estos módulos regulan y elevan la tensión de tu sistema a 35 V, asegurando que la antena funcione correctamente.",
    // linkText: "Consulta nuestras opciones de envío",
    // linkUrl: "http://localhost:3000.com/envíos  "
  },
  {
    id: 5,
    question: "¿Puedo conectar mi antena Starlink Mini a 24 V?",
    answer: "Sí. Tanto el módulo SL1230BAT como el SL1230 de SL Soluciones funcionan sin problema con entradas de 12 V o 24 V, elevando la tensión a 35 V para que la antena opere de forma estable.",
    // linkText: "Consulta nuestras opciones de envío",
    // linkUrl: "http://localhost:3000.com/envíos  "
  },
  {
    id: 6,
    question: "¿Por qué mi antena Starlink Mini no funciona a 12 V?",
    answer: "Si no utilizaste un adaptador con elevador de tensión, es muy probable que tu antena no funcione o funcione mal. Lo ideal es utilizar el módulo SL1230 o SL1230BAT de SL Soluciones, ya que eleva la tensión del vehículo a 35 V – 400 W, asegurando que a tu antena no le falte energía y funcione correctamente.",
    // linkText: "Consulta nuestras opciones de envío",
    // linkUrl: "http://localhost:3000.com/envíos  "
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

export const imagesGaleria = [
  {
    src: 'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603344/auto_qldyxb.webp',
    alt: 'Cable Starlink Mini – 12 V a 35 V',
  },
  {
    src: 'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603344/antenaEnAuto_xw3yhy.webp',
    alt: 'Pegalo en el auto y segui en movimiento',
  },
  {
    src: 'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603752/conector_zh1hpb.webp ',
    alt: 'Conector sellado antihumedad',
  },
  {
    src: 'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603345/antena_cvb9w0.webp',
    alt: 'Usalo donde lo necesites',
  },
]
