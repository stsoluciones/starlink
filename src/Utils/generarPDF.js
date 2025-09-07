import userData from "../components/constants/userData"
import logoEmpresa from '../../public/logos/logoBl.png'
import getImageBase64 from "./getImageBase64"


const generarPDF = async (empresa, items) => {
  const imageData = await getImageBase64(logoEmpresa.src)
  // cargar jsPDF y autotable bajo demanda para evitar incluirlos en el bundle inicial
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()
    const clienteX = 120 

    const img = new Image()
    img.src = imageData
    await new Promise(resolve => {
      img.onload = () => {
        const width = 20
        const height = width * (img.height / img.width)
        doc.addImage(imageData, 'PNG', 160, 10, width, height)
        resolve()
      }
    })
    doc.setFontSize(16)
    doc.text('PRESUPUESTO', 15, 15)
    
    doc.setFontSize(10)
    // 🏢 Datos de mi empresa (izquierda)
    doc.text(`${userData.name}`, 15, 52)
    doc.text(`${userData.email}`, 15, 59)
    doc.text(`+${userData.codigoPais}${userData.contact}`, 15, 66)
    doc.text(`${userData.cuil}`, 15, 73)

    // 🧾 Datos del cliente (derecha)
    doc.text(`Empresa: ${empresa.nombre}`, clienteX, 45)
    doc.text(`Dirección: ${empresa.direccion}`, clienteX, 52)
    doc.text(`Email: ${empresa.mail}`, clienteX, 59)
    doc.text(`Teléfono: ${empresa.telefono}`, clienteX, 66)
    doc.text(`CUIL: ${empresa.cuil}`, clienteX, 73)

    const dolarValue = Number(items.find(i => i?.usd && i?.dolar)?.dolar) || 1
    doc.text(`Dólar: ${dolarValue}`, 30, 78)
    
    doc.setFontSize(12)
  autoTable(doc, {
      head: [['Cantidad', 'Producto', 'Código', 'Precio', 'Total']],
      body: items.map(item => {
        const cantidad = Number(item.cantidad) || 0
        const precio = Number(item.precio) || 0
        const dolar = Number(item.dolar) || dolarValue
    
        const precioUnitario = item.usd
          ? precio.toLocaleString('es-AR', { style: 'currency', currency: 'USD' })
          : precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
    
        const precioTotal = item.usd
          ? (cantidad * precio * dolar).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
          : (cantidad * precio).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
    
        return [
          cantidad,
          item.producto,
          item.codigo,
          precioUnitario,
          precioTotal
        ]
      }),
      startY: 83,
      margin: { bottom: 20 }
    })

    const finalY = doc.lastAutoTable?.finalY || 100
    const total = items.reduce((acc, item) => {
      const cantidad = Number(item.cantidad) || 0
      const precio = Number(item.precio) || 0
      const dolar = Number(item.dolar) || dolarValue
      const precioFinal = item.usd ? precio * dolar : precio
      return acc + cantidad * precioFinal
    }, 0)
    
    doc.text(`Total: ${total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`, 150, finalY + 20)
    
  
    doc.text(`Total: ${total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS'})}`, 150, finalY + 20 )

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Observaciones: ${empresa.observaciones?empresa.observaciones:''}`, 15, 275)

    doc.setFillColor(28, 58, 109) // azul (tu color institucional)
    doc.rect(0, 280, 210, 17, 'F') // x, y, width, height, 'F' = filled

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text('Este documento no es válido como factura, es un presupuesto con impuestos incluidos.', 30, 285)

    // 🌐 URL clickeable debajo
    doc.textWithLink(`Para ver más productos puede ingresar en ${userData.urlWWW}`, 30, 291, { url: `${userData.urlWWW}` })

    const pdfBlob = doc.output('blob')
    const file = new File([pdfBlob], `presupuesto_${empresa.nombre}.pdf`, {
      type: 'application/pdf'
    })
  
    doc.save(`presupuesto_${empresa.nombre}.pdf`)
    return file
 }
  
 export default generarPDF