
const REQUIRED_VARS = {
  'ANDREANI_API_KEY': process.env.ANDREANI_CLIENT_SECRET,
  'ANDREANI_CONTRATO': process.env.ANDREANI_CONTRATO,
  'ANDREANI_REMITENTE_CUIT': '20323868906',
  'ANDREANI_REMITENTE_NOMBRE': 'RUSSO PERIELLO MATIAS GASTON',
  'ANDREANI_REMITENTE_EMAIL': 'infostarlinksoluciones@gmail.com',
  'ANDREANI_REMITENTE_TEL': '+541151012478',
  'ANDREANI_ORIGEN_CP': '1878',
  'ANDREANI_ORIGEN_CALLE': 'Roque Saenz Peña',
  'ANDREANI_ORIGEN_NUMERO': '529',
  'ANDREANI_ORIGEN_LOCALIDAD': 'Quilmes',
  'ANDREANI_ORIGEN_REGION': 'AR-B',
};

const OPTIONAL_VARS = {
  'ANDREANI_TIPO_SERVICIO': 'Tipo de servicio (default: estandar)',
  'ANDREANI_API_URL_SANDBOX': 'URL del sandbox (default: https://apissandbox.andreani.com)',
  'ANDREANI_API_URL_PRODUCCION': 'URL de producción (default: https://api.andreani.com)',
};

console.log('\n🔍 Validando configuración de Andreani...\n');

let hasErrors = false;
let hasWarnings = false;

// Verificar variables requeridas
console.log('📋 Variables Requeridas:\n');
Object.entries(REQUIRED_VARS).forEach(([key, description]) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.log(`❌ ${key}`);
    console.log(`   ${description}`);
    console.log(`   Estado: NO CONFIGURADA\n`);
    hasErrors = true;
  } else {
    // Ocultar parcialmente valores sensibles
    const masked = key.includes('KEY') || key.includes('CUIT')
      ? value.substring(0, 4) + '***' + value.substring(value.length - 4)
      : value;
    console.log(`✅ ${key}`);
    console.log(`   Valor: ${masked}\n`);
  }
});

// Verificar variables opcionales
console.log('📝 Variables Opcionales:\n');
Object.entries(OPTIONAL_VARS).forEach(([key, description]) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.log(`⚠️  ${key}`);
    console.log(`   ${description}`);
    console.log(`   Estado: Usando valor por defecto\n`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${key}`);
    console.log(`   Valor: ${value}\n`);
  }
});

// Validaciones específicas
console.log('🔬 Validaciones Específicas:\n');

// Validar formato de CUIT
const cuit = process.env.ANDREANI_REMITENTE_CUIT;
if (cuit && !/^\d{11}$/.test(cuit.replace(/\D/g, ''))) {
  console.log('⚠️  CUIT debe tener 11 dígitos (sin guiones)');
  hasWarnings = true;
} else if (cuit) {
  console.log('✅ Formato de CUIT válido');
}

// Validar formato de región
const region = process.env.ANDREANI_ORIGEN_REGION;
if (region && !/^AR-[A-Z]$/.test(region)) {
  console.log('❌ Región debe tener formato AR-{LETRA} (ej: AR-B para Buenos Aires)');
  hasErrors = true;
} else if (region) {
  console.log('✅ Formato de región válido');
}

// Validar API KEY
const apiKey = process.env.ANDREANI_API_KEY;
if (apiKey && apiKey.length < 20) {
  console.log('⚠️  API KEY parece demasiado corta. Verifica que sea correcta.');
  hasWarnings = true;
} else if (apiKey) {
  console.log('✅ API KEY configurada');
}

console.log('\n' + '='.repeat(60) + '\n');

// Resumen final
if (hasErrors) {
  console.log('❌ VALIDACIÓN FALLIDA\n');
  console.log('Faltan variables requeridas. Por favor:\n');
  console.log('1. Copia .env.andreani.example a .env.local');
  console.log('2. Completa todas las variables requeridas');
  console.log('3. Ejecuta este script nuevamente\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VALIDACIÓN COMPLETA CON ADVERTENCIAS\n');
  console.log('Las variables opcionales usan valores por defecto.');
  console.log('Puedes configurarlas en .env.local si lo necesitas.\n');
  process.exit(0);
} else {
  console.log('✅ VALIDACIÓN EXITOSA\n');
  console.log('Todas las variables están configuradas correctamente.');
  console.log('Puedes ejecutar la aplicación con: npm run dev\n');
  process.exit(0);
}
