"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, disabled = false, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [parseInt(event.target.value)];
      onValueChange?.(newValue);
    };

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "h-2 w-full appearance-none rounded-lg bg-secondary cursor-pointer",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(value[0] / (max - min)) * 100}%, hsl(var(--secondary)) ${(value[0] / (max - min)) * 100}%, hsl(var(--secondary)) 100%)`
          }}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
