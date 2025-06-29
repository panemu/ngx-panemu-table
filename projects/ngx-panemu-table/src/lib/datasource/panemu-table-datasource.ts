import { Observable, of } from "rxjs";
import { TableData } from "../table-data";
import { GroupBy, SortingInfo, TableCriteria, TableQuery } from "../table-query";
import { RowGroupData } from "../row/row-group";

const BETWEEN_EQ_START_EQ_END = '..';
const BETWEEN_EQ_START = '.,';
const BETWEEN_EQ_END = ',.';
const BETWEEN = ',,';
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
   * @returns the data in a new array
   */
  getAllData() {
    return [...this._data]
  }

  /**
   * Get data with the specified `start` index, maximum of `maxRows` is taken, matching the criteria in `tableQuery`.
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
    let result: T[] | RowGroupData[] = this.filter([...this._data], tableQuery.tableCriteria);

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
    });
  }

  protected group(result: T[], groupBy?: GroupBy): RowGroupData[] | null {
    if (!groupBy) {
      return null;
    }
    let groupMap: { [key: string]: T[] } = {};
    result.forEach((row: any) => {
      let val = row[groupBy.field];
      val = (val === null || val === undefined) ? '' : (val + '').trim();
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
    }))
  }

  protected toYear(value: string) {
    if (!value) return value;
    return value.split('-')[0] || value;
  }

  protected toMonth(value: string) {
    if (!value) return value;
    let parts = value.split('-');
    return `${parts[0]}-${parts[1]}` || value;
  }

  protected toDate(value: string) {
    if (!value) return value;
    return value.substring(0, 10);
  }


  protected filter(result: T[], tableCriteria: TableCriteria[]) {
    if (!tableCriteria?.length) {
      return result;
    }

    result = result.filter((row: any) => {
      let filterResult = false;
      for (const crit of tableCriteria) {
        let fieldValue = row[crit.field];
        let hasBeenChecked = false;
        if (typeof crit.value == 'string') {
          if (crit.value.includes(BETWEEN_EQ_START_EQ_END)) {
            filterResult = this.betweenFilter(BETWEEN_EQ_START_EQ_END, fieldValue, crit.value);
            hasBeenChecked = true;
          } else if (crit.value.includes(BETWEEN_EQ_START)) {
            filterResult = this.betweenFilter(BETWEEN_EQ_START, fieldValue, crit.value);
            hasBeenChecked = true;
          } else if (crit.value.includes(BETWEEN_EQ_END)) {
            filterResult = this.betweenFilter(BETWEEN_EQ_END, fieldValue, crit.value);
            hasBeenChecked = true;
          } else if (crit.value.includes(BETWEEN)) {
            filterResult = this.betweenFilter(BETWEEN, fieldValue, crit.value);
            hasBeenChecked = true;
          }
        }
        if (!hasBeenChecked) {
          if (typeof fieldValue == 'number') {
            filterResult = fieldValue == (+crit.value)
          } else {
            fieldValue = fieldValue ?? '';
            let stringFieldValue = String(fieldValue).trim();
            let stringCriteriaValue = String(crit.value).trim();
            if (stringCriteriaValue === 'NULL') {
              filterResult = stringFieldValue.length == 0;
            } else if (stringCriteriaValue.startsWith('"') && stringCriteriaValue.endsWith('"')) {
              filterResult = stringCriteriaValue === `"${stringFieldValue}"`; //exact match
            } else {
              filterResult = stringFieldValue.toLowerCase().includes(stringCriteriaValue.toLowerCase() )
            }
          }
        }
        if (!filterResult) {
          return false;
        }
      }
      return true;
    })
    return result;
  }

  protected betweenFilter(betweenOperator: string, value: any, criteriaValue: string) {
    let startValue: any = criteriaValue.substring(0,criteriaValue.indexOf(betweenOperator)).trim();
    let endValue: any = criteriaValue.substring(criteriaValue.indexOf(betweenOperator) + 2).trim();

    if (typeof value == 'number') {
      startValue = +startValue
      endValue = +endValue
    }
    let firstFunction = betweenOperator[0] == '.' ? (val: any) => val >= startValue : (val: any) => val > startValue;
    if (!endValue) {
      return firstFunction(value);
    }
    let secondFunction = betweenOperator[1] == '.' ? (val: any) => val <= endValue : (val: any) => val < endValue;

    return firstFunction(value) && secondFunction(value);
  }

  protected sort(result: T[], sortings: SortingInfo[]) {
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
