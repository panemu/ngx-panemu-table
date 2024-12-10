import { RowGroup, RowGroupFooter } from "./row/row-group";
import { ExpansionRow } from "./row/expansion-row";
import { NonGroupColumn, GroupedColumn, ColumnType } from "./column/column";

/**
 * Function to check if passed row is a data row. There are 4 object types that can be displayed
 * in `PanemuTableComponent`: RowGroup, RowGroupFooter, ExpansionRow, and the actual data.
 * 
 * @param row object to check
 * @returns true if row is not RowGroup nor ExpansionRow
 */
export function isDataRow(row: any) {
  return !(row instanceof ExpansionRow) && !(row instanceof RowGroup) && !(row instanceof RowGroupFooter)
}

export function formatDateToIso(d?: Date): string | undefined {
  if (!d) {
    return undefined
  }

  if (typeof d == 'string') {
    return d;
  }

  var month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

export function toDate(val: string) {
  let parts = val.split('-');
  return new Date(+parts[0], +parts[1] - 1, +parts[2])
}
/**
 * Return object with column keys and the widths
 * @param tableElement 
 * @param keepColWidth 
 * @returns 
 */
export function initTableWidth(tableElement: HTMLElement, keepColWidth = false) {
  const result: {[key: string]: number} = {};
  const thList = tableElement.querySelectorAll('th[group="false"]');
  let totWidth = 0;
  for (let index = 0; index < thList.length; index++) {
    const element = thList[index] as HTMLElement;
    let width = element.offsetWidth;
    const colId = element.getAttribute('data-col');
    if (colId) {
      const colEl = getColElement(tableElement, colId);
      if (keepColWidth && colEl.style.width) {
        let existingWidth = +colEl.style.width.replace('px', '');
        if (existingWidth) {
          width = existingWidth;
        }
      }

      /** The actual size has decimal part but css width with px unit can only 
       * has round number. The browser rounded it down. It can lead to ellipsis appears.
       * So let's add 1px.
       */
      // width += 1; //it causing horizontal scrollbar for
      
      result[colId] = width;
      setElementWidth(width, colEl)
    }
    totWidth += width;
  }
  tableElement.style.width = `${totWidth}px`;
  return result;
}

export function getColElement(tableElement: HTMLElement, id: string) {
  return tableElement.querySelector(`col[data-col="${id}"]`) as HTMLElement;
}



export function setElementWidth(w: number, element?: HTMLElement) {
  if (element) {
    element!.style.width = w + 'px';
  }
}

export function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target: any, ...sources: any) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function generateStructureKey(columns: (NonGroupColumn<any> | GroupedColumn)[]) {
  let key = '';
  for (const clm of columns) {
    if (clm.type == ColumnType.GROUP) {
      key += getColumnKey(clm as GroupedColumn);
    } else {
      key += clm.__key;
    }
  }
  return key;
}

function getColumnKey(clm: GroupedColumn) {
  let key = clm.__key!;
  for (const child of clm.children) {
    if (child.type == ColumnType.GROUP) {
      key += getColumnKey(child as GroupedColumn);
    } else {
      key += child.__key;
    }
  }
  return key;
}