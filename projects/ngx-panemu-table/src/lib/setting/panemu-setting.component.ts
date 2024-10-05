import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Component, inject, Input, OnInit } from '@angular/core';
import { PanemuTableController } from '../panemu-table-controller';
import { SettingDialogComponent } from './setting-dialog.component';

/**
 * A simple button that if clicked, will execute
 * 
 * ```
 * SettingDialogComponent.show(this.dialog, this.overlay, this.controller)
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
  standalone: true
})
export class PanemuSettingComponent implements OnInit {
  @Input({ required: true }) controller!: PanemuTableController<any>;
  dialog = inject(Dialog);
  overlay = inject(Overlay);
  constructor() { }

  ngOnInit() { }

  /**
   * Show the setting dialog.
   */
  showPanel() {
    SettingDialogComponent.show(this.dialog, this.overlay, this.controller);
  }
}