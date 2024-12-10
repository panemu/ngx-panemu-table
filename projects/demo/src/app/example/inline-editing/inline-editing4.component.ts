import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { ColumnType, EditingInfo, MapOption, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableEditingController, PanemuTableService, TABLE_MODE } from 'ngx-panemu-table';
import { DataService } from '../../service/data.service';
import { ToolbarComponent } from './toolbar.component';
import { Observable, of } from 'rxjs';

interface CustomData {
  registered: boolean
  verified_at?: string
}

const DATA: CustomData[] = [
  { registered: true, verified_at: '2024-12-25T01:10:59' },
  { registered: false },
]

class EditingController extends PanemuTableEditingController<CustomData> {

  override onCommitEdit(field: keyof CustomData, value: any, previousValue: any, rowData: CustomData, formControl: AbstractControl): void {
    if (field == 'registered') {
      this.resetVerifiedAtCell(rowData, value);
    }
  }

  private resetVerifiedAtCell(rowData: CustomData, registeredValue: any) {
    let verifiedAtControl = this.helper_getFormControl('verified_at', rowData);
    if (verifiedAtControl) {
      if (registeredValue === true || registeredValue === "true") {
        verifiedAtControl.enable();
        verifiedAtControl.addValidators(Validators.required);
      } else {
        verifiedAtControl.disable();
        verifiedAtControl.setValue(null);
        verifiedAtControl.clearValidators();
      }
      verifiedAtControl.updateValueAndValidity();
    }
  }

  override onStartEdit(rowData: CustomData, editingInfo: EditingInfo<CustomData>): void {
    this.resetVerifiedAtCell(rowData, rowData.registered)
  }

  override saveData(data: CustomData[], tableMode: TABLE_MODE): Observable<CustomData[]> {
    return of(data)
  }
}

@Component({
  standalone: true,
  imports: [PanemuTableComponent, ToolbarComponent],
  template: `
	<div class="border">
	<div><toolbar-component [controller]="controller"/></div>
	<panemu-table [controller]="controller"/>
	</div>
	`,
})
export class InlineEditing4Component implements OnInit {

  pts = inject(PanemuTableService);
  dataService = inject(DataService);

  columns = this.pts.buildColumns<CustomData>([
    { field: 'registered', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } },
    { field: 'verified_at', type: ColumnType.DATETIME },
  ])

  datasource = new PanemuTableDataSource(DATA);
  controller = PanemuTableController.create(this.columns, this.datasource, {
    autoHeight: true
  });


  ngOnInit() {
    let editingController = new EditingController();
    this.controller.editingController = editingController;
    this.controller.reloadData();
  }

}

