import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CellEditorComponent } from './editing-info';
import { CellFormatter } from '../cell/cell';

@Component({
  selector: 'boolean-cell-editor',
  imports: [ReactiveFormsModule],
  templateUrl: 'boolean-cell-editor.html'
})

export class BooleanCellEditor implements OnInit, CellEditorComponent {

  formControl!: FormControl;
  __internalFormControl!: FormControl;
  parameter?: any;
  formatter!: CellFormatter<any>;
  errorMessage!: WritableSignal<string | null>

  ngOnInit(): void {
    this.formatter = this.parameter?.['formatter'];
    
    this.__internalFormControl = new FormControl(
      this.formControl.value,
      {
        updateOn: this.formControl.updateOn,
        validators: this.formControl.validator,
        asyncValidators: this.formControl.asyncValidator

      }
    )

    
    this.__internalFormControl.valueChanges.subscribe(val => {
      if (val == 'true') {
        this.formControl.setValue(true)
      } else if (val == 'false') {
        this.formControl.setValue(false)
      } else {
        this.formControl.setValue(null);
      }
    })
  }

  clearSelection() {
    this.formControl.setValue(null);
  }
}