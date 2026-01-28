import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { classNames, vibrate } from '../../utils/helpers';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  unit,
  size = 'md',
}) => {
  const handleDecrement = () => {
    if (value > min) {
      vibrate(25);
      onChange(Math.max(min, value - step));
    }
  };
  
  const handleIncrement = () => {
    if (value < max) {
      vibrate(25);
      onChange(Math.min(max, value + step));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };
  
  const sizeStyles = {
    sm: {
      container: 'gap-2',
      button: 'w-10 h-10',
      input: 'text-xl w-16',
    },
    md: {
      container: 'gap-3',
      button: 'w-14 h-14',
      input: 'text-3xl w-24',
    },
    lg: {
      container: 'gap-4',
      button: 'w-16 h-16',
      input: 'text-4xl w-28',
    },
  };
  
  const styles = sizeStyles[size];
  
  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-dark-400 text-sm font-medium mb-2">{label}</span>
      )}
      <div className={classNames('flex items-center', styles.container)}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDecrement}
          disabled={value <= min}
          className={classNames(
            styles.button,
            'rounded-xl bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors',
            value <= min && 'opacity-40 cursor-not-allowed'
          )}
        >
          <Minus className="w-6 h-6 text-dark-200" />
        </motion.button>
        
        <div className="flex flex-col items-center">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            className={classNames(
              styles.input,
              'bg-transparent text-center font-bold text-white focus:outline-none'
            )}
            min={min}
            max={max}
          />
          {unit && (
            <span className="text-dark-400 text-xs font-medium -mt-1">{unit}</span>
          )}
        </div>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          disabled={value >= max}
          className={classNames(
            styles.button,
            'rounded-xl bg-primary-600 hover:bg-primary-500 flex items-center justify-center transition-colors',
            value >= max && 'opacity-40 cursor-not-allowed'
          )}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </div>
  );
};

