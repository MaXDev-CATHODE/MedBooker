import React, { useState, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onComplete, error }) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const triggerChange = (newValues: string[]) => {
    setValues(newValues);
    const code = newValues.join('');
    if (code.length === length) {
      onComplete(code);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // only digits
    if (!val) return;

    // Use only the last character entered
    const char = val[val.length - 1];
    const newValues = [...values];
    newValues[index] = char;
    triggerChange(newValues);

    // Focus next
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (values[index] === '') {
        // Current is empty, go to previous and clear it
        if (index > 0) {
          const newValues = [...values];
          newValues[index - 1] = '';
          triggerChange(newValues);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current
        const newValues = [...values];
        newValues[index] = '';
        triggerChange(newValues);
      }
    } else if (e.key === 'ArrowLeft') {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (!pastedData) return;

    const newValues = [...values];
    let focusIndex = 0;

    for (let i = 0; i < length; i++) {
      if (i < pastedData.length) {
        newValues[i] = pastedData[i];
        focusIndex = i;
      }
    }

    triggerChange(newValues);

    if (focusIndex < length - 1) {
      inputRefs.current[focusIndex + 1]?.focus();
    } else {
      inputRefs.current[length - 1]?.blur();
    }
  };

  return (
    <div className="flex justify-between items-center gap-2" dir="ltr">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={2} // allow multiple chars briefly so onChange gets the newest one
          value={values[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-12 h-14 text-center text-2xl font-serif text-brand-dark bg-white border-2 rounded-xl outline-none transition-all duration-300 shadow-sm
            ${error 
              ? 'border-red-300 focus:border-red-500 bg-red-50/30' 
              : 'border-slate-200 focus:border-champagne focus:shadow-champagne/10 focus:-translate-y-0.5'
            }
          `}
        />
      ))}
    </div>
  );
};

export default OtpInput;
