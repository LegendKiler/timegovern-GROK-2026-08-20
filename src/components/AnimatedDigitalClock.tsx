import React, { memo } from 'react';

interface AnimatedDigitalClockProps {
  timeStr: string;
  animationStyle?: 'flip' | 'slide';
  className?: string;
  digitClassName?: string;
  colonClassName?: string;
  amPmClassName?: string;
  showFlapCard?: boolean;
}

/**
 * Single Animated Digit Slot with 3D Flip or Vertical Slide CSS transition
 */
const AnimatedSlot: React.FC<{
  char: string;
  index: number;
  animationStyle: 'flip' | 'slide';
  digitClassName?: string;
  colonClassName?: string;
  amPmClassName?: string;
  showFlapCard?: boolean;
}> = memo(({ char, index, animationStyle, digitClassName = '', colonClassName = '', amPmClassName = '', showFlapCard = false }) => {
  // Colons and separators
  if (char === ':') {
    return (
      <span
        key={`colon-${index}`}
        className={`inline-flex items-center justify-center px-[1px] select-none font-bold animate-clock-colon ${colonClassName || 'opacity-85'}`}
        aria-hidden="true"
      >
        :
      </span>
    );
  }

  // Spaces
  if (char === ' ') {
    return <span key={`space-${index}`} className="inline-block w-[0.28em]">&nbsp;</span>;
  }

  // AM / PM Indicator
  if (char === 'A' || char === 'P' || char === 'M') {
    return (
      <span
        key={`ampm-${index}-${char}`}
        className={`inline-block select-none tracking-normal font-extrabold ${amPmClassName || 'text-[0.6em] ml-[0.15em] opacity-90'} ${
          animationStyle === 'flip' ? 'animate-digit-flip' : 'animate-digit-slide'
        }`}
      >
        {char}
      </span>
    );
  }

  // Digits (0-9)
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden h-[1.18em] align-middle tabular-nums select-none ${
        showFlapCard
          ? 'mx-[0.5px] px-[1px] rounded bg-slate-900/40 dark:bg-slate-950/70 border border-slate-700/40 shadow-2xs'
          : ''
      }`}
      style={{ perspective: '300px' }}
    >
      <span
        key={`digit-${index}-${char}`}
        className={`inline-block tabular-nums font-mono ${digitClassName} ${
          animationStyle === 'flip' ? 'animate-digit-flip' : 'animate-digit-slide'
        }`}
      >
        {char}
      </span>
    </span>
  );
});

AnimatedSlot.displayName = 'AnimatedSlot';

/**
 * Animated Digital Clock Component with sub-character level CSS flip/slide animations
 */
export const AnimatedDigitalClock: React.FC<AnimatedDigitalClockProps> = memo(({
  timeStr,
  animationStyle = 'flip',
  className = '',
  digitClassName = '',
  colonClassName = '',
  amPmClassName = '',
  showFlapCard = false
}) => {
  if (!timeStr) return null;

  const chars = timeStr.split('');

  return (
    <span
      className={`inline-flex items-center font-mono tabular-nums tracking-tight leading-none ${className}`}
      aria-label={`Time: ${timeStr}`}
    >
      {chars.map((ch, idx) => (
        <AnimatedSlot
          key={idx}
          char={ch}
          index={idx}
          animationStyle={animationStyle}
          digitClassName={digitClassName}
          colonClassName={colonClassName}
          amPmClassName={amPmClassName}
          showFlapCard={showFlapCard}
        />
      ))}
    </span>
  );
});

AnimatedDigitalClock.displayName = 'AnimatedDigitalClock';
