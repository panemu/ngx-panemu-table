import { Component, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { CellEditorRenderer, ColumnType, DefaultCellRenderer, EditingInfo, MapOption, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableEditingController, PanemuTableService, PropertyColumn, TABLE_MODE } from 'ngx-panemu-table';
import { DataService } from '../../service/data.service';
import { ToolbarComponent } from './toolbar.component';
import { CustomAmountEditor } from './custom-amount-editor';

interface CustomData {
  id: number
  amount: number
}

const DATA: CustomData[] = [
  {
    id: 1,
    amount: 5
  },
  {
    id: 2,
    amount: 3
  },
  {
    id: 3,
    amount: 4
  },
]

class EditingController extends PanemuTableEditingController<CustomData> {

  getNewRowId?: () => number;

  form: { [f in keyof Required<CustomData>]: () => FormControl | undefined } = {
    id: () => undefined,
    amount: () => new FormControl<number>(0)
  }

  override createFormControl(field: keyof CustomData, rowData: CustomData, tableMode: TABLE_MODE): AbstractControl | null | undefined {
    return this.form[field]();
  }

  override initCellEditorRenderer(renderer: CellEditorRenderer<CustomData>, column: PropertyColumn<CustomData>): CellEditorRenderer<CustomData> | null {
    if (column.__key == 'amount_1') {
      return null;
    } else if (column.__key == 'amount_2') {
      renderer.component = CustomAmountEditor;
    }
    return renderer;
  }

}

@Component({
    imports: [PanemuTableComponent, ToolbarComponent],
    template: `
  <div class="border">
    <div><toolbar-component [controller]="controller"/></div>
    <panemu-table [controller]="controller"/>
	</div>
  <ng-template #amountTemplate let-column="column" let-row="row">
    <div>
      <div style="border: 1px solid gray; width: 100%;">
        <div style="background-color: aqua;" [style.width]="((row[column.field] || 0) * 10) + '%'">
          <span style="margin-left: 2px;">
            {{row[column.field]}}
          </span>
        </div>
      </div>
    </div>
  </ng-template>
	`
})
export class InlineEditing6Component implements OnInit {

  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  amountTemplate = viewChild<TemplateRef<any>>('amountTemplate');
  columns = this.pts.buildColumns<CustomData>([
    { field: 'id', type: ColumnType.INT },
    { field: 'amount', type: ColumnType.INT, label: 'Amount (Default Editor)' },
    { field: 'amount', cellRenderer: DefaultCellRenderer.create(this.amountTemplate), width: 150, label: 'Amount (No Editor)' },
    { field: 'amount', type: ColumnType.INT, label: 'Amount (Custom Editor)' },
  ])

  datasource = new PanemuTableDataSource(DATA);
  controller!: PanemuTableController<CustomData>;

  ngOnInit() {
    this.controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), {
      autoHeight: true
    })
    let editingController = new EditingController();
    editingController.getNewRowId = () => this.controller.getData().length + 1;
    this.controller.editingController = editingController;
    this.controller.reloadData();
  }
}

