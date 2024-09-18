import { RowGroup } from "./row/row-group";
import { ExpansionRow } from "./row/expansion-row";

/**
 * Function to check if passed row is a data row. There are 3 object types that can be displayed
 * in `PanemuTableComponent`: RowGroup, ExpansionRow and the actual data.
 * 
 * @param row object to check
 * @returns true if row is not RowGroup nor ExpansionRow
 */
export function isDataRow(row: any) {
  return !(row instanceof ExpansionRow) && !(row instanceof RowGroup)
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

export function initTableWidth(tableElement: HTMLElement) {
  const thList = tableElement.querySelectorAll('th[group="false"]');
  let totWidth = 0;
  for (let index = 0; index < thList.length; index++) {
    const element = thList[index] as HTMLElement;
    const colId = element.getAttribute('data-col');
    if (colId) {
      const colEl = getColElement(tableElement, colId);
      setElementWidth(element.offsetWidth, colEl)
    }
    totWidth += element.offsetWidth;
  }
  tableElement.style.width = `${totWidth}px`;
}

export function getColElement(tableElement: HTMLElement, id: string) {
  return tableElement.querySelector(`col[data-col="${id}"]`) as HTMLElement;
}



export function setElementWidth(w: number, element?: HTMLElement) {
  if (element) {
    element!.style.width = w + 'px';
  }
}
