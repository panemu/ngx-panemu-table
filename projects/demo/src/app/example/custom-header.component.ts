import { Component, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { BaseColumn, ColumnType, ComputedColumn, DefaultHeaderRenderer, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, PropertyColumn } from 'ngx-panemu-table';
import { People } from '../model/people';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HeaderTextCaseComponent } from './custom-cell/header-text-case.component';

const DATA: People[] = [
  {"id":1,"name":"Abagail Kingscote","email":"akingscote0@imdb.com","gender":"F","enrolled":"2023-04-26","country":"Philippines","amount":9339.72,"last_login":"2024-07-03 09:56:29","verified":true},
  {"id":2,"name":"Nicolina Coit","email":"ncoit1@vk.com","gender":"M","enrolled":"2023-11-01","country":"Kazakhstan","amount":3744.95,"last_login":"2024-04-29 12:48:59","verified":false},
  {"id":3,"name":"Sarene Greim","email":"sgreim2@seesaa.net","gender":"M","enrolled":"2023-01-03","country": null,"amount":4397.68,"last_login":"2024-06-03 13:14:23","verified":true},
  {"id":4,"name":"Blair Millbank","gender":"F","enrolled":"2023-07-01","country":"Philippines","amount":3334.58,"last_login":"2024-06-18 12:06:58","verified":false},
  {"id":5,"name":"Kliment Sprowle","email":"ksprowle4@alexa.com","gender":"M","enrolled":"2023-12-25","country":"Indonesia","amount":6459.93,"last_login":"2024-04-24 03:46:26","verified":true},
]

@Component({
    templateUrl: 'custom-header.component.html',
    imports: [PanemuTableComponent, ReactiveFormsModule]
})
export class CustomHeaderComponent implements OnInit {
  pts = inject(PanemuTableService);
  customHeader = viewChild<TemplateRef<any>>('customHeader');
  customColumns = this.pts.buildColumns<People>([
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: {F: 'Girl', M: 'Boy'} },
    { field: 'country' },
    { field: 'amount' },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified'}
  ]);
  clmCustom: ComputedColumn = { type: ColumnType.COMPUTED, formatter: (_) => '', headerRenderer: DefaultHeaderRenderer.create(this.customHeader) };
  columns = this.pts.buildColumns<People>([
    { field: 'id' },
    { field: 'name', headerRenderer: {component: HeaderTextCaseComponent} },
    this.clmCustom,

  ])

  cmbColumnHeader = new FormControl(this.customColumns.body[0].__key)
  controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), {autoHeight: true});

  ngOnInit() {
    this.controller.reloadData();
    
    this.cmbColumnHeader.valueChanges.subscribe({
      next: val => {
        this.changeColumn(val);
      }
    });
    this.changeColumn(this.cmbColumnHeader.value)
  }

  private changeColumn(key?: string | null) {
    if (!key) return;
    const clm = this.customColumns.body.find(item => item.__key == key);
    if (!clm) return;

    const propColumn = this.clmCustom as PropertyColumn<People>;
    propColumn.formatter = clm.formatter!;
    propColumn.field = clm.field;
    console.log(`active column ${clm.field}`)
  }

}