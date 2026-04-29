import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input: React.FC<InputProps> = ({ label, error, hint, className = '', ...props }) => {
  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-xs uppercase tracking-widest font-semibold text-slate-400 mb-1">
          {label}
          {props.required && <span className="text-champagne ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-0 py-3 border-0 border-b-2 bg-transparent text-brand-dark placeholder-slate-400
          focus:outline-none focus:ring-0 focus:border-champagne transition-colors duration-300
          disabled:border-slate-100 disabled:cursor-not-allowed disabled:text-slate-400
          ${error ? 'border-red-300' : 'border-slate-200'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
      {hint && !error && <p className="mt-2 text-xs text-slate-400 font-light">{hint}</p>}
    </div>
  );
};

export default Input;
