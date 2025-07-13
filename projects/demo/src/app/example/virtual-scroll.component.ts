import { ChangeDetectorRef, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { ColumnType, DefaultRowGroupRenderer, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import { CustomTableFooter } from './custom-table-footer.component';

@Component({
    imports: [PanemuTableComponent, PanemuQueryComponent],
    templateUrl: './virtual-scroll.component.html',
    styleUrl: './virtual-scroll.component.scss'
})
export class VirtualScrollComponent {
  footerTemplate = viewChild<TemplateRef<any>>('footerTemplate');
  pts: PanemuTableService = inject(PanemuTableService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    { field: 'email'},
    { field: 'gender'},
    { field: 'country', rowGroupRenderer: DefaultRowGroupRenderer.create({ header: { showPagination: true } }) },
    { field: 'amount'},
    { field: 'enrolled'},
    { field: 'last_login'},
    { field: 'verified', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } }
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, 
    this.datasource,
    {
      virtualScroll: true,
      virtualScrollRowHeight: 32,
      footer: {
        component: this.footerTemplate
      }
    }
  );
  cdr = inject(ChangeDetectorRef);
  dataService = inject(DataService);

  ngOnInit() {
    const data: People[] = [];
    const countryMap = Object.keys(this.dataService.getCountryMap());
    for (let index = 1; index <= 10000; index++) {
      const row: People = {
        id: index,
        name: `name ${index}`,
        email: `email${index}@panemu.com`,
        gender: index % 2 == 0 ? 'F' : 'M',
        enrolled: `enrolled ${index}`,
        country: countryMap[index % countryMap.length],
        amount: index,
        last_login: `last_login ${index}`,
        verified: index % 3 == 0
      };
      data.push(row)
    }
    this.datasource.setData(data);

    // this.controller.groupByColumns = [{field: 'country'}]
    this.controller.reloadData();

    this.controller.afterReloadEvent.subscribe({
      next: _ => {
        console.log('after reload')
      }
    })

  }
  
  scrollDown() {
    const viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport')[0];
    viewport.scrollTo(0, viewport.scrollHeight);
  }
  scrollUp() {
    const viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport')[0];
    viewport.scrollTo(0, 0);
  }

  toFooterTemplate() {
    console.log('switch to footer template')
    this.controller = PanemuTableController.create<People>(this.columns, 
      this.datasource,
      {
        virtualScroll: true,
        virtualScrollRowHeight: 32,
        footer: {
          component: this.footerTemplate
        }
      }
    );

    this.controller.reloadData();
  }

  toFooterComponent() {
    console.log('switch to footer component')
    this.controller = PanemuTableController.create<People>(this.columns, 
      this.datasource,
      {
        virtualScroll: true,
        virtualScrollRowHeight: 32,
        footer: {
          component: CustomTableFooter,
          parameter: { click: this.toFooterTemplate.bind(this)}
        }
      }
    );

    this.controller.reloadData();
  }
}
