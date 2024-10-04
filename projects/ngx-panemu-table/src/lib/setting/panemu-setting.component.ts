import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Component, inject, Input, OnInit } from '@angular/core';
import { PanemuTableController } from '../panemu-table-controller';
import { SettingDialogComponent } from './setting-dialog.component';

@Component({
	selector: 'panemu-setting',
	templateUrl: 'panemu-setting.component.html',
	standalone: true
})

export class PanemuSettingComponent implements OnInit {
	@Input({required: true}) controller!: PanemuTableController<any>;
	dialog = inject(Dialog);
	overlay = inject(Overlay);
	constructor() { }

	ngOnInit() { }

	showPanel() {
		SettingDialogComponent.show(this.dialog, this.overlay, this.controller);
	}
}