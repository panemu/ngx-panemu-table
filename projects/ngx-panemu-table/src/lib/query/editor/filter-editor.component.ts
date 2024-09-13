import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, Type } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PropertyColumn } from '../../column/column';
import { TableCriteria } from '../../table-query';
import { FilterEditor } from './filter-editor';
import { StringFilterComponent } from './string-filter.component';

@Component({
  selector: 'panemu-filter-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-editor.component.html',
})
export class FilterEditorComponent implements OnInit {
  columns!: PropertyColumn<any>[];
  // criteria!: TableCriteria
  field = new FormControl('');
  filter!: TableCriteria;
  editorComponent?: Type<FilterEditor>
  column?: PropertyColumn<any>
  value = signal<string|undefined|null>('');

  constructor(private dialogRef: MatDialogRef<FilterEditorComponent, TableCriteria>,
  ) {

  }
  ngOnInit(): void {
    this.field.valueChanges.subscribe({
      next: f => {
        this.resetEditor(f);
      }
    });
    this.resetEditor(this.filter.field)
  }

  private resetEditor(f: string | null) {
    this.column = this.columns.find(item => item.field == f);
    if (this.column) {
      this.editorComponent = this.column?.filterEditor || StringFilterComponent;
    } else {
      this.editorComponent = undefined;
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  apply() {
    const filter: TableCriteria = {field: this.field.value!, value: this.value()}
    this.dialogRef.close(filter);
  }
  static show(dialog: MatDialog, columns: PropertyColumn<any>[], filter: TableCriteria): Promise<TableCriteria> {
    const dialogRef = dialog.open(FilterEditorComponent);
    dialogRef.componentInstance.columns = columns.filter(item => item.filterable);
    dialogRef.componentInstance.filter = filter;
    dialogRef.componentInstance.field.setValue(filter.field);
    return firstValueFrom(dialogRef.afterClosed())
  }
}
