
import { RowGroup } from "../row/row-group";

export type RefreshPagination = (start: number, maxRows: number, totalRows: number) => void;

export interface PanemuPaginationController {
  __refreshPagination?: RefreshPagination
  startIndex: number
  maxRows: number
  __reloadGroup: (group: RowGroup) => void
  reloadCurrentPage: Function
}