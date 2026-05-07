import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cycle-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="cycle-selector">
      <label for="cycle-day">Cycle</label>
      <select
        id="cycle-day"
        [ngModel]="cycleStartDay()"
        (ngModelChange)="onDayChange($event)"
        aria-label="Cycle start day"
      >
        @for (day of days; track day) {
          <option [ngValue]="day">{{ day }}</option>
        }
      </select>
    </div>
  `,
  styleUrl: './cycle-selector.scss',
})
export class CycleSelector {
  readonly cycleStartDay = input.required<number>();
  readonly cycleChange = output<number>();

  protected readonly days = [1, 5, 10, 15, 20, 25];

  protected onDayChange(value: number): void {
    this.cycleChange.emit(value);
  }
}
