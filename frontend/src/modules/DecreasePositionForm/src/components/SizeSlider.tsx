import type { FC } from 'react';
import { Slider } from 'radix-ui';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { FormContext } from '../contexts/FormContext';
import * as $ from './SizeSlider.css';

export const SizeSlider: FC = () => {
  const { getSizeDeltaAsPercentage, updateSizeDeltaFromPercentage } =
    useRequiredContext(FormContext);

  const valueInPercents = getSizeDeltaAsPercentage();

  const handlePercentageClick = (percentage: number) => {
    updateSizeDeltaFromPercentage(String(percentage));
  };

  const handleSliderSlide = ([value]: number[]) => {
    updateSizeDeltaFromPercentage(String(value));
  };

  return (
    <>
      <div className={$.sliderHeader}>
        <span className={$.sliderLabel}>Percentage</span>
        <span className={$.sliderValue}>{Number(valueInPercents).toFixed(0)}%</span>
      </div>

      <Slider.Root
        className={$.sliderRoot}
        value={[Number(valueInPercents)]}
        onValueChange={handleSliderSlide}
        min={0}
        max={100}
        step={1}
      >
        <Slider.Track className={$.sliderTrack}>
          <Slider.Range className={$.sliderRange} />
        </Slider.Track>
        <Slider.Thumb className={$.sliderThumb} aria-label="Decrease percentage" />
      </Slider.Root>

      <div className={$.percentageMarks}>
        {PERCENTAGE_MARKS.map((mark) => (
          <button
            key={mark}
            type="button"
            className={`${$.percentageMark} ${
              Number(valueInPercents) === mark ? $.percentageMarkActive : ''
            }`}
            onClick={() => handlePercentageClick(mark)}
          >
            {mark}%
          </button>
        ))}
      </div>
    </>
  );
};

const PERCENTAGE_MARKS = [0, 25, 50, 75, 100] as const;
