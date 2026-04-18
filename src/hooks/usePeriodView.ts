import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatMonthAndYear, addMonths } from '@/utils/date';
import bsLib from 'bikram-sambat';

export function usePeriodView() {
  const { selectedMonthIso, setSelectedMonthIso, settings } = useStore();
  
  const selectedMonthDate = useMemo(() => new Date(selectedMonthIso), [selectedMonthIso]);

  const monthName = useMemo(() => {
    return formatMonthAndYear(selectedMonthDate, settings.dateDisplay);
  }, [selectedMonthDate, settings.dateDisplay]);

  const monthBoundaries = useMemo(() => {
    let start, end;
    if (settings.dateDisplay === 'BS') {
      const b = bsLib.toBik(selectedMonthDate);
      const startDay = bsLib.toGreg(b.year, b.month, 1);
      start = new Date(startDay.year, startDay.month - 1, startDay.day);
      const nextM = b.month === 12 ? 1 : b.month + 1;
      const nextY = b.month === 12 ? b.year + 1 : b.year;
      const nextMonthFirstDay = bsLib.toGreg(nextY, nextM, 1);
      end = new Date(nextMonthFirstDay.year, nextMonthFirstDay.month - 1, nextMonthFirstDay.day);
      end.setMilliseconds(-1);
    } else {
      start = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), 1);
      end = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + 1, 0, 23, 59, 59);
    }
    return { start, end };
  }, [selectedMonthDate, settings.dateDisplay]);

  const changeMonth = (dir: number) => {
    const newDate = addMonths(selectedMonthDate, dir, settings.dateDisplay);
    setSelectedMonthIso(newDate.toISOString());
  };

  return { selectedMonthDate, monthName, monthBoundaries, changeMonth };
}
