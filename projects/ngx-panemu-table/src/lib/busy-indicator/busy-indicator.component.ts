import { Component } from '@angular/core';
import { SpinningIconComponent } from './spinning-icon.component';
import { PanemuTableService } from '../panemu-table.service';
import { LabelTranslation } from '../option/label-translation';

@Component({
    selector: 'pnm-busy-indicator',
    templateUrl: 'busy-indicator.component.html',
    imports: [SpinningIconComponent]
})

export class BusyIndicatorComponent {
  labelTranslation: LabelTranslation
  constructor(service: PanemuTableService){
    this.labelTranslation = service.getLabelTranslation();
  }

}
