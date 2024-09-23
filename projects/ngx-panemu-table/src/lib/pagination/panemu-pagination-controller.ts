
import { RowGroup } from "../row/row-group";

export type RefreshPagination = (start: number, maxRows: number, totalRows: number) => void;

export interface PanemuPaginationController {
  initPaginationComponent: (refreshEvent: RefreshPagination) => void
  startIndex: number
  maxRows: number
  reloadGroup: (group: RowGroup) => void
  reloadCurrentPage: Function
}