import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppSelectOption, AppSelectPicker } from '../app-select-picker/app-select-picker';
import {
  CYCLE_START_VALUES,
  LAST_DAY_OF_MONTH,
  SECOND_LAST_DAY_OF_MONTH,
} from '../../utils/cycle-start';

@Component({
  selector: 'app-cycle-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppSelectPicker],
  template: `
    <div class="cycle-selector">
      <span class="cycle-label">Cycle</span>
      <app-select-picker
        sheetTitle="Cycle start day"
        [options]="options"
        [value]="cycleStartDay().toString()"
        [compact]="true"
        (valueChange)="onDayChange($event)"
      />
    </div>
  `,
  styleUrl: './cycle-selector.scss',
})
export class CycleSelector {
  readonly cycleStartDay = input.required<number>();
  readonly cycleChange = output<number>();

  protected readonly options: readonly AppSelectOption[] = CYCLE_START_VALUES.map((day) => ({
    value: day.toString(),
    label: this.optionLabel(day),
    detail: this.optionDetail(day),
  }));

  protected onDayChange(value: string): void {
    this.cycleChange.emit(Number(value));
  }

  private optionLabel(day: number): string {
    if (day === LAST_DAY_OF_MONTH) {
      return 'Last day';
    }
    if (day === SECOND_LAST_DAY_OF_MONTH) {
      return 'Second-last day';
    }
    return day.toString();
  }

  private optionDetail(day: number): string {
    if (day === LAST_DAY_OF_MONTH) {
      return 'Last day of each month to the day before the next month-end';
    }
    if (day === SECOND_LAST_DAY_OF_MONTH) {
      return 'Second-last day of each month to the day before the next cycle';
    }
    return `Budget cycle runs from day ${day} to the previous day next month`;
  }
}
