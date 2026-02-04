import { type FC, use } from 'react';
import { Slider } from 'radix-ui';
import { useController, useWatch } from 'react-hook-form';
import { KernelContext } from '../contexts';
import {
  calculateSizeFromPercentage,
  calculateSliderPercentage,
  useFieldsAsserter,
} from '../utils';
import * as $ from './SizePercentageSlider.css';

type SizePercentageSliderProps = {
  label?: string;
};

export const SizePercentageSlider: FC<SizePercentageSliderProps> = ({ label = 'Percentage' }) => {
  useFieldsAsserter(['sizeDelta', 'totalSize'], 'SizePercentageSlider');
  const { control } = use(KernelContext)!;
  const { field: sizeDeltaField } = useController({ control, name: 'sizeDelta' });
  const totalSize = useWatch({ control, name: 'totalSize' });

  const valueInPercents = calculateSliderPercentage(sizeDeltaField.value ?? '', totalSize ?? '');

  const handlePercentageClick = (percentage: number) => {
    const newSize = calculateSizeFromPercentage(String(percentage), totalSize ?? '');
    sizeDeltaField.onChange(newSize === '0' ? '' : newSize);
  };

  const handleSliderSlide = ([value]: number[]) => {
    const newSize = calculateSizeFromPercentage(String(value), totalSize ?? '');
    sizeDeltaField.onChange(newSize === '0' ? '' : newSize);
  };

  return (
    <>
      <div className={$.sliderHeader}>
        <span className={$.sliderLabel}>{label}</span>
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
        <Slider.Thumb className={$.sliderThumb} aria-label="Percentage" />
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
