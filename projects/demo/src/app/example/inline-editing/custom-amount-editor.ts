import { Component, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { CellEditorComponent, CellValidationError } from 'ngx-panemu-table';

@Component({
    imports: [MatSliderModule, ReactiveFormsModule],
    template: `
	<mat-slider min="0" max="10" step="1" [title]="errorMessage() || ''">
  		<input matSliderThumb [formControl]="formControl" [value]="formControl.value">
	</mat-slider>
	`
})

export class CustomAmountEditor implements CellEditorComponent {
	formControl!: FormControl;
	parameter?: any;
	errorMessage!: WritableSignal<string | CellValidationError | null>;

	ngOnInit() { }
}