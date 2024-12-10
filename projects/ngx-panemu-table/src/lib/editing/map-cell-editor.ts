import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CellEditorComponent } from './editing-info';
import { SpinningIconComponent } from "../busy-indicator/spinning-icon.component";

export interface MapOption {
  value: any;
  label: string;
}

@Component({
  selector: 'map-cell-editor',
  standalone: true,
  imports: [ReactiveFormsModule, SpinningIconComponent],
  templateUrl: 'map-cell-editor.html'
})

export class MapCellEditor implements OnInit, CellEditorComponent {
  
  formControl!: FormControl;
  parameter?: any;
  options?: WritableSignal<MapOption[] | undefined>;
  errorMessage!: WritableSignal<string | null>
  loading?: WritableSignal<MapOption[] | undefined>;

  ngOnInit(): void {
    this.options = this.parameter?.['options'];
    this.loading = this.parameter?.['loading'];
  }

  clearSelection() {
    this.formControl.setValue(null);
  }
}