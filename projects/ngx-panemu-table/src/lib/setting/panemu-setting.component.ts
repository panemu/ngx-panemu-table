import { Component, inject, Input, OnInit } from '@angular/core';
import { PanemuTableController } from '../panemu-table-controller';
import { MatMenuModule } from '@angular/material/menu';
import { PanemuTableService } from '../panemu-table.service';

/**
 * A simple button that if clicked, will execute
 * 
 * ```
 * PanemuTableController.showSettingDialog()
 * ```
 * 
 * That dialog provide a UI to change column visibility, position and stickiness.
 * 
 * To use it, in your html file put this code:
 * 
 * ```html
 * <panemu-setting [controller]="controller"/>
 * ```
 */
@Component({
  selector: 'panemu-setting',
  templateUrl: 'panemu-setting.component.html',
  standalone: true,
  imports: [MatMenuModule]
})
export class PanemuSettingComponent {
  @Input({ required: true }) controller!: PanemuTableController<any>;
  pts = inject(PanemuTableService);
  labelTranslaction = this.pts.getLabelTranslation();

  /**
   * Show the setting dialog.
   */
  showSettingPanel() {
    this.controller.showSettingDialog();
  }

  exportToCsv() {
    this.controller.exportToCsv();
  }

  transposeSelectedRow() {
    this.controller.transposeSelectedRow();
  }
}