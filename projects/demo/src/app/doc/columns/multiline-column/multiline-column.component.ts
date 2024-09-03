import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../../model/people';

const DATA: People[] = [
  {"id":1,"name":"Abagail Kingscote","email":"akingscote0@imdb.com","gender":"F","enrolled":"2023-04-26","country":"Philippines","amount":9339.72,"last_login":"2024-07-03 09:56:29","verified":true},
  {"id":2,"name":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vel lectus sed metus porttitor tempus nec ut neque. Nulla bibendum arcu eu nibh laoreet, at iaculis sapien mollis.","email":"ncoit1@vk.com","gender":"M","enrolled":"2023-11-01","country":"Kazakhstan","amount":3744.95,"last_login":"2024-04-29 12:48:59","verified":false},
  {"id":3,"name":"Sarene Greim","email":"sgreim2@seesaa.net","gender":"M","enrolled":"2023-01-03","country": null,"amount":4397.68,"last_login":"2024-06-03 13:14:23","verified":true},
  {"id":4,"name":"Blair Millbank","gender":"F","enrolled":"2023-07-01","country":"Philippines","amount":3334.58,"last_login":"2024-06-18 12:06:58","verified":false},
  {"id":5,"name":"Kliment Sprowle","email":"ksprowle4@alexa.com","gender":"M","enrolled":"2023-12-25","country":"Indonesia","amount":6459.93,"last_login":"2024-04-24 03:46:26","verified":true},
]

@Component({
  templateUrl: 'multiline-column.component.html',
  imports: [PanemuTableComponent],
  standalone: true,
  styleUrl: 'multiline-column.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class MultilineColumnnComponent implements OnInit {

  columns = this.pts.buildColumns<People>([
    { field: 'id', width: 50 },
    { field: 'name', width: 300 },
    { field: 'email', width: 200 },
    { field: 'gender' },
    { field: 'country' },
    { field: 'amount' },
    { field: 'enrolled' },
    { field: 'last_login', width: 200 },
    { field: 'verified'}
  ])

  controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA));

  constructor(private pts: PanemuTableService) { }

  ngOnInit() {
    this.controller.reloadData();
  }

}