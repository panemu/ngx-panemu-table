import { Component, OnInit, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CellEditorComponent } from './editing-info';

@Component({
  selector: 'date-cell-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<input type="date" [formControl]="formControl" class="editor-input" [title]="errorMessage() || ''">`
})

export class DateCellEditor implements CellEditorComponent {
  formControl!: FormControl;
  errorMessage!: WritableSignal<string | null>
}