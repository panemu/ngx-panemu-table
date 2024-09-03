import { Observable, of } from "rxjs";
import { RowGroup } from "../row/row-group";
import { GroupBy, SortingInfo, TableCriteria, TableQuery } from "../table-query";
import { TableData } from "../table-data";

/**
 * A convenience datasource class that handle client side sorting, filtering, grouping and pagination.
 */
export class PanemuTableDataSource<T> {

  private _data: T[] = [];

  /**
   * 
   * @param data the data similar to calling `setData()` method
   */
  constructor(data?: T[]) {
    if (data?.length) {
      this.setData(data)
    }
  }

  /**
   * Set data to the datasource.
   * 
   * @param data 
   */
  setData(data: T[]) {
    this._data = data;
  }

  /**
   * Get all data in this datasource from the `setData()` method or from the constructor.
   * @returns 
   */
  getAllData() {
    return [...this._data]
  }

  /**
   * Get data from specified `start` index, maximum of `maxRows` is taken, matching the criteria in `tableQuery`.
   * @param start 
   * @param maxRows 
   * @param tableQuery 
   * @returns 
   */
  getData(start: number, maxRows: number, tableQuery: TableQuery): Observable<TableData<T>> {
    if (!this._data?.length) {
      return of({
        rows: [],
        totalRows: 0
      })
    }
    // const startTime = new Date()
    //filter
    let result: T[] | RowGroup[] = this.filter(this._data, tableQuery.tableCriteria);

    //sort
    this.sort(result, tableQuery.sortingInfos)

    //group
    result = this.group(result, tableQuery.groupBy) || result;

    let totalRows = result.length;
    if (maxRows > 0) {
      result = result.slice(start, Math.min(result.length, start + maxRows));
    }
    // const endTime = new Date()
    // const elapsed = endTime.getTime() - startTime.getTime()
    // console.log('get data elapsed', startTime.getTime(), elapsed, endTime )
    return of({
      rows: result,
      totalRows
    } as any);
  }

  private group(result: T[], groupBy?: GroupBy) {
    if (!groupBy) {
      return null;
    }
    let groupMap: { [key: string]: T[] } = {};
    result.forEach((row: any) => {
      let val = row[groupBy.field] + '';

      if (groupBy.modifier == 'year') {
        val = this.toYear(val);
      } else if (groupBy.modifier == 'month') {
        val = this.toMonth(val);
      } else if (groupBy.modifier == 'day') {
        val = this.toDate(val);
      }

      let groupMember = groupMap[val];
      if (!groupMember) {
        groupMember = []
        groupMap[val] = groupMember;
      }
      groupMember.push(row)
    })

    return Object.keys(groupMap).map(key => ({
      value: key,
      count: groupMap[key].length
    } as RowGroup))
  }

  private toYear(value: string) {
    if (!value) return value;
    return value.split('-')[0] || value;
  }

  private toMonth(value: string) {
    if (!value) return value;
    let parts = value.split('-');
    return `${parts[0]}-${parts[1]}` || value;
  }

  private toDate(value: string) {
    if (!value) return value;
    return value.substring(0, 10);
  }


  private filter(result: T[], tableCriteria: TableCriteria[]) {
    if (!tableCriteria?.length) {
      return [...result];
    }

    result = result.filter((a: any) => {
      let result = false;
      for (const crit of tableCriteria) {
        let value = a[crit.field] + '';
        
        if (typeof value == 'number') {
          result = value == (+crit.value)
        } else {
          result = (value).toLowerCase().includes((crit.value + '').replaceAll('"', '').toLowerCase() )
        }
        if (!result) {
          return false;
        }
      }
      return true;
    })
    return result;
  }

  private sort(result: T[], sortings: SortingInfo[]) {
    if (!sortings?.length) {
      return;
    }

    result.sort((a: any, b: any) => {
      let result = 0;
      for (const s of sortings) {
        const aValue = a[s.field] ?? '';
        const bValue = b[s.field] ?? '';
        
        if (aValue > bValue) {
          result = 1;
        } else if (aValue < bValue) {
          result = -1;
        }
        if (result != 0) {
          if (s.direction == "desc") {
            result *= -1;
          }
          return result;
        }
      }
      return result;
    })
  }
}