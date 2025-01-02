import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { ColumnType, EditingInfo, MapOption, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableEditingController, PanemuTableService, TABLE_MODE } from 'ngx-panemu-table';
import { DataService } from '../../service/data.service';
import { ToolbarComponent } from './toolbar.component';
import { take } from 'rxjs';

interface CustomData {
  id: number
  description: string
  country: string
  city: string
}

const COUNTRIES = [
  { code: 'ID', name: 'Indonesia', cities: [{ code: 'JKT', name: 'Jakarta' }, { code: 'YOG', name: 'Yogyakarta' }] },
  { code: 'WL', name: 'Wonderland', cities: [{ code: 'CT1', name: 'City 1' }, { code: 'CT2', name: 'City 2' }] }
]

const DATA: CustomData[] = [
  {
    id: 1,
    description: 'Country and city are editable',
    country: 'ID',
    city: 'JKT'
  },
  {
    id: 2,
    description: 'Only city is editable',
    country: 'ID',
    city: 'YOG'
  },
  {
    id: 3,
    description: 'None is editable',
    country: 'WL',
    city: 'CT1'
  }
]

class EditingController extends PanemuTableEditingController<CustomData> {

  getNewRowId?: () => number;

  form: { [f in keyof Required<CustomData>]: () => FormControl | undefined } = {
    id: () => undefined,
    description: () => new FormControl(),
    country: () => new FormControl(),
    city: () => new FormControl()
  }

  override createFormControl(field: keyof CustomData, rowData: CustomData, tableMode: TABLE_MODE): AbstractControl | null | undefined {
    if (tableMode == 'edit') {
      if (rowData.id == 1 && ['country', 'city'].includes(field)) {
        return this.form[field]?.();
      } else if (rowData.id == 2 && field == 'city') {
        return this.form[field]?.();
      }
    } else {
      return this.form[field]?.();
    }
    return null;
  }

  override createNewRowData(): Partial<CustomData> {
    return { description: 'This is a new row' }
  }

  override onCommitEdit(field: keyof CustomData, value: any, previousValue: any, rowData: CustomData, formControl: AbstractControl): void {
    if (field == 'country') {
      if (value == 'WL') {
        this.helper_getFormControl('city', rowData)?.setValue('CT2');
      } else {
        this.helper_getFormControl('city', rowData)?.setValue(null);
      }
      this.resetCityOptions(rowData);
    }
  }

  override onStartEdit(rowData: CustomData, editingInfo: EditingInfo<CustomData>): void {
    this.resetCityOptions(rowData);
  }

  private resetCityOptions(rowData: CustomData) {
    
    let newoptions: MapOption[] | undefined = [];
    if (rowData.country) {
      this.helper_updateMapCellLoading('city', rowData, true)
      newoptions = COUNTRIES.find(item => item.code == rowData.country)?.cities?.map(item => ({ value: item.code, label: item.name }));
      setTimeout(() => {
        this.helper_updateMapCellOptions('city', rowData, newoptions);
        this.helper_updateMapCellLoading('city', rowData, false)
      }, 1000);
    } else {
      this.helper_updateMapCellOptions('city', rowData, []);
    }
  }
}

@Component({
  standalone: true,
  imports: [PanemuTableComponent, ToolbarComponent],
  template: `
	<div class="border">
	<div><toolbar-component [controller]="controller" [allowInsert]="false" [allowDelete]="false"/></div>
	<panemu-table [controller]="controller"/>
	</div>
	`,
})
export class InlineEditing3Component implements OnInit {

  pts = inject(PanemuTableService);
  dataService = inject(DataService);

  columns = this.pts.buildColumns<CustomData>([
    { field: 'id', type: ColumnType.INT },
    { field: 'description' },
    { field: 'country', type: ColumnType.MAP, valueMap: this.createCountryList() },
    { field: 'city', type: ColumnType.MAP, valueMap: this.createCityList() },
  ])

  datasource = new PanemuTableDataSource(DATA);
  controller!: PanemuTableController<CustomData>;

  private createCountryList() {
    let result: any = {};
    for (const country of COUNTRIES) {
      result[country.code] = country.name
    }
    return result;
  }

  private createCityList() {
    let result: any = {};
    for (const country of COUNTRIES) {
      for (const city of country.cities) {
        result[city.code] = city.name
      }
    }
    return result;
  }

  ngOnInit() {
    this.controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), {
      autoHeight: true
    })
    let editingController = new EditingController();
    editingController.getNewRowId = () => this.controller.getData().length + 1;
    this.controller.editingController = editingController;

    //set initial mode to be edit mode
    this.controller.afterReloadEvent.pipe(
      take(1)
    ).subscribe(() => {
      this.controller.edit();
    });
    
    this.controller.reloadData();
  }
}

