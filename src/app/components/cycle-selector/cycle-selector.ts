import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppSelectOption, AppSelectPicker } from '../app-select-picker/app-select-picker';

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

  protected readonly options: readonly AppSelectOption[] = [1, 5, 10, 15, 20, 25].map((day) => ({
    value: day.toString(),
    label: day.toString(),
    detail: `Budget cycle begins on day ${day}`,
  }));

  protected onDayChange(value: string): void {
    this.cycleChange.emit(Number(value));
  }
}
