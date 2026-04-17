// @ts-ignore
import bs from 'bikram-sambat';

export const BS_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 
  'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 
  'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export const formatDisplayDate = (dateIso: string, mode: 'BS' | 'AD'): string => {
  const date = new Date(dateIso);
  
  if (mode === 'BS') {
    const bsDate = bs.toBik(date);
    if (bsDate) {
      return `${bsDate.day} ${BS_MONTHS[bsDate.month - 1]} ${bsDate.year}`;
    }
  }
  
  // AD fallback
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getMonthName = (dateIso: string, mode: 'BS' | 'AD'): string => {
  const date = new Date(dateIso);
  if (mode === 'BS') {
    const bsDate = bs.toBik(date);
    if (bsDate) {
      return BS_MONTHS[bsDate.month - 1];
    }
  }
  return date.toLocaleDateString('en-US', { month: 'short' });
};

export const parseIsoDate = (dateIso: string) => new Date(dateIso);

/**
 * Get start and end date for a given period in UTC
 */
export const getPeriodDates = (period: 'this_month' | 'this_week', date: Date = new Date()) => {
  const start = new Date(date);
  start.setUTCHours(0,0,0,0);
  const end = new Date(date);
  end.setUTCHours(23,59,59,999);

  if (period === 'this_month') {
    start.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + 1);
    end.setUTCDate(0);
  } else if (period === 'this_week') {
    const day = start.getUTCDay();
    const diff = start.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
    start.setUTCDate(diff);
    end.setUTCDate(start.getUTCDate() + 6);
  }

  return { start, end };
};
