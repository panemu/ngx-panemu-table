import { Component } from '@angular/core';
import { ColumnType, ColumnDefinition, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';

const DATA: People[] = [
  { "id": 1, "name": "Abagail Kingscote", "email": "akingscote0@imdb.com", "gender": "F", "enrolled": "2023-04-26", "country": "Philippines", "amount": 9339.72, "last_login": "2024-07-03 09:56:29", "verified": true },
  { "id": 2, "name": "Nicolina Coit", "email": "ncoit1@vk.com", "gender": "M", "enrolled": "2023-11-01", "country": "Kazakhstan", "amount": 3744.95, "last_login": "2024-04-29 12:48:59", "verified": false },
  { "id": 3, "name": "Sarene Greim", "email": "sgreim2@seesaa.net", "gender": "M", "enrolled": "2023-01-03", "country": "United States", "amount": 4397.68, "last_login": "2024-06-03 13:14:23", "verified": true },
  { "id": 4, "name": "Blair Millbank", "email": "bmillbank3@aboutads.info", "gender": "F", "enrolled": "2023-07-01", "country": "Philippines", "amount": 3334.58, "last_login": "2024-06-18 12:06:58", "verified": false },
  { "id": 5, "name": "Kliment Sprowle", "email": "ksprowle4@alexa.com", "gender": "M", "enrolled": "2023-12-25", "country": "Indonesia", "amount": 6459.93, "last_login": "2024-04-24 03:46:26", "verified": true },
  { "id": 6, "name": "Winifred Dikle", "email": "wdikle5@ifeng.com", "gender": "F", "enrolled": "2023-08-06", "country": "Kazakhstan", "amount": 9833.93, "last_login": "2024-05-19 14:39:17", "verified": false },
  { "id": 7, "name": "Chadd Nacci", "email": "cnacci6@biblegateway.com", "gender": "M", "enrolled": "2023-01-03", "country": "China", "amount": 4383.54, "last_login": "2024-05-12 11:25:03", "verified": true },
  { "id": 8, "name": "Matthiew Morland", "email": "mmorland7@toplist.cz", "gender": "F", "enrolled": "2023-10-22", "country": "Greece", "amount": 9727.9, "last_login": "2024-03-25 10:35:03", "verified": false },
  { "id": 9, "name": "Perceval Glasheen", "email": "pglasheen8@pinterest.com", "gender": "M", "enrolled": "2023-07-23", "country": "Netherlands", "amount": 7201.29, "last_login": "2024-07-01 17:23:03", "verified": true },
  { "id": 10, "name": "Fenelia Oblein", "email": "foblein9@mozilla.com", "gender": "M", "enrolled": "2023-10-13", "country": "Sweden", "amount": 3654.03, "last_login": "2024-07-25 10:20:02", "verified": false }
]

@Component({
  selector: 'app-column-group',
  standalone: true,
  imports: [PanemuTableComponent],
  template: `
  <div class="flex flex-col gap-4">
    <div class="flex gap-4">
      <button data-test-id="btn2" (click)="group1()">Group 1</button>
      <button data-test-id="btn3" (click)="group2()">Group 2</button>
      <button data-test-id="btn1" (click)="noGroup()">No Group</button>
    </div>
    <div>
      <panemu-table [controller]="controller"></panemu-table>
    </div>
  </div>
  `,
})
export class ColumnGroupComponent {
  columns!: ColumnDefinition<People>;

  controller!: PanemuTableController<People>;

  constructor(private pts: PanemuTableService) { }

  ngOnInit() {
    // this.noGroup();
    this.group1();
  }

  noGroup() {
    this.columns = this.pts.buildColumns<People>([
      { field: 'id' },
      { field: 'name' },
      { field: 'gender' },
      { field: 'email' },
      { field: 'country' },
      { field: 'enrolled' },
      { field: 'last_login' },
      { field: 'verified' },
      { field: 'amount' },
    ]);
      
    this.controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), {autoHeight: true});
    this.controller.reloadData();
  }
  group1() {
    this.columns = this.pts.buildColumns<People>([
      { field: 'id' },

      { field: 'country' },
      {
        type: ColumnType.GROUP, label: 'Date Info', children: [
          { field: 'enrolled' },
          { field: 'last_login' },
        ]
      },
      { field: 'verified' },
      {
        type: ColumnType.GROUP, label: 'Biodata', children: [
          { field: 'name' },
          { field: 'gender' },
          { field: 'email' },
        ]
      },
      { field: 'amount' },
    ]);

    this.controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), {autoHeight: true});
    this.controller.reloadData();
  }
  
  group2() {
    this.columns = this.pts.buildColumns<People>([
      { field: 'id' },
      {
        type: ColumnType.GROUP, label: 'Other Data', children: [
          { field: 'country' },
          {
            type: ColumnType.GROUP, label: 'Date Info', children: [
              { field: 'enrolled' },
              { field: 'last_login' },
            ]
          },
          { field: 'verified' },
        ]
      },
      {
        type: ColumnType.GROUP, label: 'Biodata', children: [
          { field: 'name' },
          { field: 'gender' },
          { field: 'email' },
        ]
      },

      { field: 'amount' },
    ]);

    this.controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), {autoHeight: true});
    this.controller.reloadData();
  }

}
