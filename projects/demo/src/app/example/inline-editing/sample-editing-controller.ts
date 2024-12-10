import { CellValidationError, PanemuTableDataSource, PanemuTableEditingController, TABLE_MODE } from "ngx-panemu-table";
import { DocumentationService } from "../documentation.service";

export class SampleEditingController<T> extends PanemuTableEditingController<T> {

  constructor(protected docService: DocumentationService){
    super();
  }

  override showValidationError(error: CellValidationError | string, label: {[field in keyof T]: string}): void {
    let message = '';
    if (typeof error == 'string') {
      message = error
    } else {
      for (let field in error) {
        if (typeof error[field] == 'object') {
          message += `<strong>${(label as any)[field]}</strong>: ${JSON.stringify(error[field])}<br>`
        } else {
          message += `<strong>${(label as any)[field]}</strong>: ${error[field]}<br>`
        }
      }
    }
    this.docService.showDialogError(message)
  }

  override async canDelete(rowToDelete: T, tableMode: TABLE_MODE): Promise<boolean> {
    let answer = await this.docService.showDialogConfirm('Are you sure to delete selected row?')
    return answer == 'yes';
  }

  override async canReload(changedRows: T[], tableMode: TABLE_MODE): Promise<boolean> {
    let answer = await this.docService.showDialogConfirm('Unsaved data will be lost. Are you sure to reload data?')
    return answer == 'yes';
  }

  protected dummySave(data: any[], tableMode: TABLE_MODE, datasource: PanemuTableDataSource<any>) {
    let dsData = datasource.getAllData();
    if (tableMode == 'edit') {
        data.forEach(changedRow => {
          let dsRow = dsData.find(item => item.id == changedRow.id);
          if (dsRow) {
            Object.assign(dsRow, changedRow);
          }
        })
      } else {
        data.forEach(item => {
          if (!item.id) {
            item.id = dsData.reduce((accumulator: number, row: any) => Math.max(accumulator, row.id), 0) + 1;
            dsData.push(item)
          }
        })
        datasource.setData(dsData);
      }
  }
  
  protected dummyDelete(data: any, datasource: PanemuTableDataSource<any>) {
    let dsData = datasource.getAllData();
    let idx = dsData.findIndex(item => item.id == data.id);
    if (idx >= 0) {
      dsData.splice(idx, 1);
      datasource.setData(dsData);
    }
  }
  
  protected getCurrentLocalDateTime() {
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0,16);
  }
}