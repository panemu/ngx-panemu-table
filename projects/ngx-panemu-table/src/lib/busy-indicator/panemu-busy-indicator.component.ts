import { Component, Input } from '@angular/core';
import { SpinningIconComponent } from './spinning-icon.component';
import { PanemuTableService } from '../panemu-table.service';
import { LabelTranslation } from '../option/label-translation';

@Component({
  selector: 'panemu-busy-indicator',
  templateUrl: 'panemu-busy-indicator.component.html',
  standalone: true,
  imports: [SpinningIconComponent],
})

export class PanemuBusyIndicatorComponent {
  labelTranslation: LabelTranslation
  @Input() label?: string;
  constructor(service: PanemuTableService){
    this.labelTranslation = service.getLabelTranslation();
  }

}
