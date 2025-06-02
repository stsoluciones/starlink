//src/Utils/mapEstadoMP.js
const mapEstadoMP=(status) => {
  switch (status) {
    case 'approved':
      return 'pagado';
    case 'pending':
    case 'in_process':
      return 'pendiente';
    case 'rejected':
    case 'cancelled':
    case 'refunded':
    case 'charged_back':
      return 'cancelado';
    default:
      return 'pendiente';
  }
}
export default mapEstadoMP;