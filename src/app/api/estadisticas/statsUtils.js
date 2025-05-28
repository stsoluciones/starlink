export function getDateRange(timeRange) {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (timeRange) {
    case 'semana':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'mes_anterior':
      startDate.setMonth(now.getMonth() - 1, 1);
      endDate.setMonth(now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'mes':
    default:
      startDate.setDate(1);
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  if (timeRange !== 'mes_anterior') {
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}