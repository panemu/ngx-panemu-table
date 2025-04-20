import { CellFormatter, ColumnDefinition, PanemuTableDataSource, TableCriteria } from "ngx-panemu-table";

export class GlobalSearchDataSource<T> extends PanemuTableDataSource<T> {

  private formatters: { [key: string]: CellFormatter } = {};

  constructor(columns: ColumnDefinition<T>) {
    super()
    this.formatters = columns.body.map(col => ({ [col.field]: col.formatter! })).reduce((acc, cur) => ({ ...acc, ...cur }), {});
  }

  protected override filter(result: T[], tableCriteria: TableCriteria[]): T[] {
    if (!tableCriteria?.length || !tableCriteria[0].value) {
      return result;
    }
    let searchKeyword = String(tableCriteria[0].value).toLowerCase();
    return result.filter((item: any) => {

      for (const field of Object.keys(this.formatters)) {
        let formattedValue = String((this.formatters[field](item[field]) ?? '')).toLowerCase();
        if (formattedValue.includes(searchKeyword)) {
          return true;
        }
      }
      return false;
    })
  }
}