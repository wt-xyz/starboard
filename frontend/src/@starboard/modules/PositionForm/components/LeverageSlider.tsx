import { type FC, use, useCallback } from 'react';
import { Slider } from 'radix-ui';
import { useController } from 'react-hook-form';
import { KernelContext } from '@/modules/PositionForm/src/contexts';
import { useFieldsAsserter } from '@/modules/PositionForm/src/utils';
import * as $ from './LeverageSlider.css';

type LeverageSliderProps = {
  label?: string;
};

export const LeverageSlider: FC<LeverageSliderProps> = ({ label: _label = 'Leverage' }) => {
  useFieldsAsserter(['leverage'], 'LeverageSlider');
  const { control } = use(KernelContext)!;
  const { field, fieldState } = useController({ control, name: 'leverage' });

  const stepIdx = STEP_VALUES.indexOf(+field.value!);
  const thumbPercent = (stepIdx / (STEP_VALUES.length - 1)) * 100;

  const handleSliderChange = ([idx]: number[]) => {
    field.onChange(String(STEP_VALUES[idx]));
  };

  const handleLabelClick = (value: number) => {
    field.onChange(String(value));
  };

  const handleInputChange = useCallback(
    (value: string) => {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        field.onChange(value);
      }
    },
    [field]
  );

  const handleInputBlur = useCallback(() => {
    const num = parseFloat(field.value ?? '');
    if (isNaN(num)) {
      field.onChange(String(STEP_VALUES[0]));
      return;
    }
    const clamped = Math.min(100, Math.max(0.1, num));
    const nearest = STEP_VALUES.reduce((prev, curr) =>
      Math.abs(curr - clamped) < Math.abs(prev - clamped) ? curr : prev
    );
    field.onChange(String(nearest));
  }, [field]);

  return (
    <div className={$.sliderContainer}>
      {fieldState.error && <span className={$.error}>{fieldState.error.message}</span>}
      <div className={$.sliderRow}>
        <div className={$.sliderColumn}>
          <div className={$.trackWrapper}>
            {LABEL_PERCENTAGE_MARKS.slice(1).map((mark) => (
              <span
                key={mark}
                className={mark <= thumbPercent ? $.trackDotActive : $.trackDotInactive}
                style={{ left: `${mark}%` }}
              />
            ))}
            <Slider.Root
              className={$.sliderRoot}
              value={[stepIdx]}
              onValueChange={handleSliderChange}
              min={0}
              max={STEP_VALUES.length - 1}
              step={1}
            >
              <Slider.Track className={$.sliderTrack}>
                <Slider.Range className={$.sliderRange} />
              </Slider.Track>
              <Slider.Thumb className={$.sliderThumb} />
            </Slider.Root>
          </div>

          <div className={$.labelsRow}>
            {LABEL_PERCENTAGE_MARKS.map((mark, index) => {
              const isFirst = index === 0;
              const isLast = index === LABEL_PERCENTAGE_MARKS.length - 1;
              return (
                <button
                  key={mark}
                  type="button"
                  className={`${$.labelButton} ${isFirst ? $.labelButtonFirst : ''} ${isLast ? $.labelButtonLast : ''}`}
                  style={{ left: `${mark}%` }}
                  onClick={() => handleLabelClick(LABELS[index])}
                >
                  {LABELS[index]}x
                </button>
              );
            })}
          </div>
        </div>

        <div className={$.leverageInputWrapper}>
          <input
            type="text"
            inputMode="decimal"
            className={$.leverageInput}
            value={field.value ?? ''}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
          />
          <span className={$.leverageSuffix}>x</span>
        </div>
      </div>
    </div>
  );
};

const LABEL_PERCENTAGE_MARKS = [0, 14, 29, 43, 57, 71, 86, 100];
const LABELS = [0.1, 1, 2, 5, 10, 25, 50, 100];

// prettier-ignore
const STEP_VALUES = [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,

    1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2,

    2.3, 2.6, 2.9, 3.2, 3.5, 3.8, 4.1, 4.4, 4.7, 5,

    5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,

    11.5, 13, 14.5, 16, 17.5, 19, 20.5, 22, 23.5, 25,

    27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50,

    55, 60, 65, 70, 75, 80, 85, 90, 95, 100
  ];
