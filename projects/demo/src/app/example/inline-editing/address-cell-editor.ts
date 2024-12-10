import { Component, computed, effect, WritableSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CellEditorComponent, CellValidationError } from 'ngx-panemu-table';

@Component({
  selector: 'string-cell-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: 'address-cell-editor.html',
  styleUrl: 'address-cell-editor.scss'
})

export class AddressCellEditor implements CellEditorComponent {

  formControl!: FormGroup;
  errorMessage!: WritableSignal<string | CellValidationError>;
  streetError = computed(() => {
    if (this.errorMessage() && typeof this.errorMessage() == 'object' && Object.keys(this.errorMessage()).includes('street')) {
      return (this.errorMessage() as CellValidationError)['street']
    }
    return ''
  })

  zipError = computed(() => {
    if (this.errorMessage() && typeof this.errorMessage() == 'object' && Object.keys(this.errorMessage()).includes('zipCode')) {
      return (this.errorMessage() as CellValidationError)['zipCode']
    }
    return ''
  })

  formGroupError = computed(() => {
    return typeof this.errorMessage() == 'string' ? this.errorMessage() : ''
  })
  
  constructor() {
    effect(() => console.log(JSON.stringify(this.errorMessage())))
  }
}