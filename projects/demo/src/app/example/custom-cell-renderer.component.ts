import { ChangeDetectorRef, Component, inject, PLATFORM_ID, signal, TemplateRef, viewChild, ViewEncapsulation, WritableSignal } from '@angular/core';
import { ColumnType, DefaultCellRenderer, PanemuSettingComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import { ChartCellComponent } from './custom-cell/chart-cell.component';
import { isPlatformBrowser } from '@angular/common';

interface People2 extends People {
  amountHistory: WritableSignal<number[]>
}
@Component({
  selector: 'app-custom-cell-renderer',
  standalone: true,
  imports: [PanemuTableComponent, PanemuSettingComponent],
  templateUrl: './custom-cell-renderer.component.html',
  styleUrl: './custom-cell-renderer.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CustomCellRendererComponent {
  pts = inject(PanemuTableService);
  amountTemplate = viewChild<TemplateRef<any>>('amountTemplate');
  columns = this.pts.buildColumns<People2>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    { field: 'amount' },
    { field: 'amount', cellRenderer: DefaultCellRenderer.create(this.amountTemplate), width: 150 },
    {
      type: ColumnType.COMPUTED, 
      formatter: (val: any, rowData?: any) => {
        return rowData.amountHistory?.().join(',')
      }, 
      cellRenderer: ChartCellComponent.create('amountHistory'),
      label: 'Amount History',
      width: 250
    },
    { field: 'email' },
    { field: 'enrolled' },
    { field: 'last_login' },
    { field: 'verified', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } }
  ])
  datasource = new PanemuTableDataSource<People2>;
  controller = PanemuTableController.create<People2>(this.columns,
    this.datasource,
    {
      virtualScroll: true,
      virtualScrollRowHeight: 56, //make it to match the chart height
      rowOptions: {
        rowStyle: (row) => 'height: 56px' //make it to match the chart height
      }
    },
    
  );
  cdr = inject(ChangeDetectorRef);
  dataService = inject(DataService);
  inv: any;
  platformId = inject(PLATFORM_ID);

  constructor() { }

  ngOnInit() {
    const data: People2[] = [];
    const countryMap = Object.keys(this.dataService.getCountryMap());
    for (let index = 10000; index > 0; index--) {
      const row: People2 = {
        id: index,
        name: `name ${index}`,
        email: `email${index}@panemu.com`,
        gender: index % 2 == 0 ? 'F' : 'M',
        enrolled: `enrolled ${index}`,
        country: countryMap[index % countryMap.length],
        amount: 1,
        last_login: `last_login ${index}`,
        verified: index % 3 == 0,
        amountHistory: signal([1])
      };
      data.push(row)
    }
    this.datasource.setData(data);

    this.controller.reloadData();


    /**
     * SSR related. Check if this component is running on browser.
     */
    if (isPlatformBrowser(this.platformId)) {
      this.inv = setInterval(() => {
        for (const dt of this.datasource.getAllData()) {
          dt.amount = Math.floor(Math.random() * 10);
          let amounts = [...dt.amountHistory()];
          if (amounts.length > 9) {
            amounts.shift();
          }
          amounts.push(dt.amount);
          dt.amountHistory.set(amounts);
        }
        
        //this markForCheck is required by the first Amount column. It force the table
        //to re-render the new amount value
        this.controller.markForCheck();
        
      }, 1000);
    }

  }

  ngOnDestroy(): void {
    if (this.inv) {
      clearInterval(this.inv)
    }
  }


}
