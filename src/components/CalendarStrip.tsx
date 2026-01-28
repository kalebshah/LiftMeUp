import React from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { classNames } from '../utils/helpers';
import { useApp } from '../context/AppContext';

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const { state } = useApp();
  const today = new Date();
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const hasWorkout = (date: Date) => {
    return state.workoutLogs.some(
      log => log.isComplete && isSameDay(new Date(log.date), date)
    );
  };
  
  return (
    <div className="flex justify-between gap-2 px-2">
      {days.map((date, index) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);
        const hasCompleted = hasWorkout(date);
        
        return (
          <motion.button
            key={date.toISOString()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectDate(date)}
            className={classNames(
              'flex flex-col items-center p-2 rounded-xl transition-all duration-200 flex-1 min-w-[44px]',
              isSelected
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-dark-800/50 text-dark-300 hover:bg-dark-700/50'
            )}
          >
            <span className={classNames(
              'text-xs font-medium uppercase',
              isSelected ? 'text-primary-100' : 'text-dark-400'
            )}>
              {format(date, 'EEE')}
            </span>
            <span className={classNames(
              'text-lg font-bold mt-1',
              isToday && !isSelected && 'text-primary-400'
            )}>
              {format(date, 'd')}
            </span>
            {hasCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={classNames(
                  'w-1.5 h-1.5 rounded-full mt-1',
                  isSelected ? 'bg-white' : 'bg-success-400'
                )}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

