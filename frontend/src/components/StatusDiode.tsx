'use client';

import React, { useState } from 'react';

export type DiodeState = 'blue' | 'yellow' | 'red';

interface StatusDiodeProps {
  initialState?: DiodeState;
  state?: DiodeState;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  bootPulse?: boolean;
  className?: string;
}

export const StatusDiode: React.FC<StatusDiodeProps> = ({
  initialState = 'blue',
  state: controlledState,
  size = 'md',
  interactive = true,
  bootPulse = false,
  className = '',
}) => {
  const [internalState, setInternalState] = useState<DiodeState>(initialState);
  const currentState = controlledState !== undefined ? controlledState : internalState;

  const cycleState = () => {
    if (!interactive) return;
    setInternalState(prev => {
      if (prev === 'blue') return 'yellow';
      if (prev === 'yellow') return 'red';
      return 'blue';
    });
  };

  const dimensions = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size];

  const dotDimensions = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }[size];

  const stateStyles = {
    blue: {
      border: 'border-[#00D1FF]',
      glow: 'shadow-[0_0_8px_rgba(0,209,255,0.45)]',
      dot: 'bg-[#00D1FF]',
      label: 'IDBLUE #00D1FF WRK / NORMAL FUNCTIONING',
    },
    yellow: {
      border: 'border-[#FFF500] animate-diode-pulse',
      glow: 'shadow-[0_0_10px_rgba(255,245,0,0.6)]',
      dot: 'bg-[#FFF500]',
      label: 'IDYELLOW #FFF500 LDNG / SITE LOADING',
    },
    red: {
      border: 'border-[#FF0000]',
      glow: 'shadow-[0_0_8px_rgba(255,0,0,0.5)]',
      dot: 'bg-[#FF0000]',
      label: 'IDRED #FF0000 ERR / NETWORK ERROR',
    },
  }[currentState];

  return (
    <div
      onClick={cycleState}
      title={`${stateStyles.label} (Click to cycle)`}
      className={`relative rounded-full border-2 ${stateStyles.border} ${stateStyles.glow} ${dimensions} flex items-center justify-center transition-all ${
        interactive ? 'cursor-pointer hover:scale-110' : ''
      } ${bootPulse ? 'animate-diode-boot' : ''} ${className}`}
    >
      <div className={`rounded-full ${stateStyles.dot} ${dotDimensions} transition-colors`} />
    </div>
  );
};
