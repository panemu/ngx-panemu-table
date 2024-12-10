import { ChangeDetectorRef, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { ColumnType, DefaultRowGroupRenderer, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { SampleEditingController } from './sample-editing-controller';
import { DocumentationService } from '../documentation.service';
import { ToolbarComponent } from './toolbar.component';


class EditingController extends SampleEditingController<People> {
  override createNewRowData(): Partial<People> {
      return {id: 0, name: 'name 0'}
  }
}

@Component({
  imports: [PanemuTableComponent, PanemuQueryComponent, ToolbarComponent],
  standalone: true,
  templateUrl: './inline-editing5.component.html',
})
export class InlineEditing5Component {
  pts = inject(PanemuTableService);

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
    }
  );
  cdr = inject(ChangeDetectorRef);
  dataService = inject(DataService);
  docService = inject(DocumentationService);

  constructor() { }

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

    this.controller.editingController = new EditingController(this.docService);
    this.controller.reloadData();

    this.controller.afterReloadEvent.subscribe({
      next: _ => {
        console.log('after reload')
      }
    })

  }
  
  scrollDown() {
    const viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport')[0];
    // viewport.dispatchEvent(new Event('scroll'));
    viewport.scrollTo(0, viewport.scrollHeight);
    this.cdr.markForCheck();
  }
  scrollUp() {
    const viewport = document.getElementsByTagName('cdk-virtual-scroll-viewport')[0];
    viewport.scrollTo(0, 0);
  }

}
