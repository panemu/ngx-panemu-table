import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { People } from '../model/people';
import { PanemuTableDataSource, TableQuery } from 'ngx-panemu-table';
import { delay, mergeMap, of, tap } from 'rxjs';

export interface Car {
	id: number;
	vin: string;
	brand: string;
	production_year: number;
	color: string;
 }

@Injectable({
	providedIn: 'root'
 })
 export class DataService {
	mockedServerDatasource = new PanemuTableDataSource<People>()

	constructor(
	  private http: HttpClient,
	) {
	}
 
	getCars() {
	  return this.http.get<Car[]>('./data/cars-large.json');
	}

	getPeople() {
		return this.http.get<People[]>('./data/people.json');
	}

	getMockedServerData(start: number, maxRows: number, tableQuery: TableQuery) {
		const observable = this.mockedServerDatasource.getAllData().length ? of({}) : this.getPeople().pipe(
			tap(result => this.mockedServerDatasource.setData(result))
		);

		return observable.pipe(
			delay(500),
			
			mergeMap(_ => this.mockedServerDatasource.getData(start, maxRows, tableQuery))
		)
		
	}
 }
 