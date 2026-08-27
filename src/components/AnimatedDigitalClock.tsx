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

  if (char === ' ') {
    return <span key={`space-${index}`} className="inline-block w-[0.28em]">&nbsp;</span>;
  }

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

  return (
    <span
      key={`digit-${index}-${char}`}
      className={`relative inline-flex items-center justify-center overflow-hidden h-[1.18em] align-middle tabular-nums ${
        animationStyle === 'flip' ? 'animate-digit-flip' : 'animate-digit-slide'
      } ${digitClassName}`}
    >
      {showFlapCard ? (
        <span className="inline-flex items-center justify-center min-w-[0.62em] px-[0.04em] rounded-[0.12em] bg-black/10 dark:bg-white/5">
          {char}
        </span>
      ) : (
        char
      )}
    </span>
  );
});
AnimatedSlot.displayName = 'AnimatedSlot';

export const AnimatedDigitalClock: React.FC<AnimatedDigitalClockProps> = ({
  timeStr,
  animationStyle = 'flip',
  className = '',
  digitClassName = '',
  colonClassName = '',
  amPmClassName = '',
  showFlapCard = false,
}) => {
  const chars = Array.from(timeStr || '');

  return (
    <span
      className={`inline-flex items-center tg-time tabular-nums tracking-tight leading-none ${className}`}
      aria-label={timeStr}
    >
      {chars.map((char, index) => (
        <AnimatedSlot
          key={`${index}-${char}`}
          char={char}
          index={index}
          animationStyle={animationStyle}
          digitClassName={digitClassName}
          colonClassName={colonClassName}
          amPmClassName={amPmClassName}
          showFlapCard={showFlapCard}
        />
      ))}
    </span>
  );
};

export default AnimatedDigitalClock;
