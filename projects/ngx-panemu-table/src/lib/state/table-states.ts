import { GroupBy, TableCriteria } from "../table-query";

export interface ColumnState {
  key: string
  width?: number
  sticky?: 'start' | 'end' | null
  visible: boolean
  children?: ColumnState[]
}

export interface TableState {
  structureKey: string;
  groupByColumns?: GroupBy[];
  criteria?: TableCriteria[];
  startIndex: number;
  sorting: { [key: string]: 'asc' | 'desc' };
  maxRows: number;
  columns: ColumnState[];
}
