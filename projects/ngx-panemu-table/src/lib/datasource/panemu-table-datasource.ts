import { Observable, of, throwError } from "rxjs";
import { TableData } from "../table-data";
import { GroupBy, SortingInfo, TableQuery } from "../table-query";
import { RowGroupData } from "../row/row-group";
import { Predicate } from "../query/query-builder/types";


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
    try {
      if (!this._data?.length) {
        return of({
          rows: [],
          totalRows: 0
        })
      }
      // const startTime = new Date()
      //filter
      let result: T[] | RowGroupData[] = this.filter([...this._data], tableQuery.where);

      //sort
      this.sort(result, tableQuery.orderBy)

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
    } catch (e) {
      return throwError(() => e);
    }
  }

  protected group(result: T[], groupBy?: GroupBy): RowGroupData[] | null {
    if (!groupBy) {
      return null;
    }
    let orderOfKeys: any[] = [];
    let groupMap: Map<any, T[]> = new Map;
    result.forEach((row: any) => {
      let val = row[groupBy.field];
      val = (val === null || val === undefined) ? '' : val;
      if (groupBy.modifier == 'year') {
        val = this.toYear(val);
      } else if (groupBy.modifier == 'month') {
        val = this.toMonth(val);
      } else if (groupBy.modifier == 'day') {
        val = this.toDate(val);
      }

      let groupMember = groupMap.get(val);
      if (!groupMember) {
        orderOfKeys.push(val);
        groupMember = []
        groupMap.set(val, groupMember);
      }
      groupMember.push(row)
    })


    const groupResult: RowGroupData[] = orderOfKeys.map(key => {
      const groupMember = groupMap.get(key);
      return {
        value: key,
        count: groupMember?.length ?? 0,
      }
    });

    return groupResult;
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


  protected filter(result: T[], predicate?: Predicate | null) {
    if (!predicate) {
      return result;
    }

    return result.filter(row => this.evaluatePredicate(row, predicate));
  }

  protected evaluatePredicate(row: any, predicate: Predicate): boolean {
    switch (predicate.type) {
      case 'and':
        return predicate.operands.every(p => this.evaluatePredicate(row, p));
      case 'or':
        return predicate.operands.some(p => this.evaluatePredicate(row, p));
      case 'isNull':
        return row[predicate.field] === null || row[predicate.field] === undefined;
      case 'isNotNull':
        return row[predicate.field] !== null && row[predicate.field] !== undefined;
      case 'eq':
      case 'neq': {
        const value = row[predicate.field];
        const target = predicate.value;
        const equal = predicate.caseInsensitive && typeof value === 'string' && typeof target === 'string'
          ? value.toLowerCase() === target.toLowerCase()
          : value === target;
        return predicate.type === 'eq' ? equal : !equal;
      }
      case 'lt':
        return row[predicate.field] < predicate.value;
      case 'lte':
        return row[predicate.field] <= predicate.value;
      case 'gt':
        return row[predicate.field] > predicate.value;
      case 'gte':
        return row[predicate.field] >= predicate.value;
      case 'in':
        return predicate.values.includes(row[predicate.field]);
      case 'notIn':
        return !predicate.values.includes(row[predicate.field]);
      case 'like': {
        const value = row[predicate.field];
        if (value === null || value === undefined) return false;
        const haystack = predicate.caseInsensitive ? String(value).toLowerCase() : String(value);
        const raw = predicate.caseInsensitive ? predicate.pattern.toLowerCase() : predicate.pattern;
        const lead = raw.startsWith('%');
        const trail = raw.endsWith('%');
        const core = raw.slice(lead ? 1 : 0, trail ? raw.length - 1 : raw.length);
        if (lead && trail) return haystack.includes(core);
        if (trail) return haystack.startsWith(core);
        if (lead) return haystack.endsWith(core);
        return haystack === core;
      }
    }

    throw new Error('Uknown predicate');
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
