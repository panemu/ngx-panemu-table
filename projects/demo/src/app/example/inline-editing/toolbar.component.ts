import { Component, computed, input, OnInit } from '@angular/core';
import { PanemuTableController } from 'ngx-panemu-table';

@Component({
  selector: 'toolbar-component',
  templateUrl: 'toolbar.component.html',
  standalone: true,
})

export class ToolbarComponent {
  controller = input<PanemuTableController<any>>();
  allowInsert = input<boolean>(true);
  allowDelete = input<boolean>(true);
  canDelete = computed(() => this.controller()?.mode() != 'edit' && this.controller()?.selectedRowSignal());
  browse = computed(() => this.controller()?.mode() == 'browse')
  canInsert = computed(() => this.controller()?.mode() != 'edit')
  canSave = computed(() => this.controller()?.mode() != 'browse')
  
  reload() {
    this.controller()?.reloadCurrentPage();
  }

  insert() {
    this.controller()?.insert();
  }

  edit() {
    this.controller()?.edit();
  }

  deleteRow() {
    this.controller()?.deleteSelectedRow();
  }

  export() {
    this.controller()?.exportToCsv();
  }

  save() {
    this.controller()?.save();
  }
}