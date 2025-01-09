import { CellFormatter, ColumnDefinition, PanemuTableDataSource, TableCriteria } from "ngx-panemu-table";

export class ColumnSearchDataSource<T> extends PanemuTableDataSource<T> {

  private formatters: { [key: string]: CellFormatter } = {};

  constructor(columns: ColumnDefinition<T>) {
    super()
    this.formatters = columns.body.map(col => ({ [col.field]: col.formatter! })).reduce((acc, cur) => ({ ...acc, ...cur }), {});
  }

  protected override filter(result: T[], tableCriteria: TableCriteria[]): T[] {
    if (!tableCriteria?.length || !tableCriteria[0].value) {
      return result;
    }
    return result.filter((item: any) => {
      for (const crit of tableCriteria) {
        let searchKeyword = String(crit.value).toLowerCase();
        let formattedValue = String((this.formatters[crit.field](item[crit.field]) ?? '')).toLowerCase();
        if (!formattedValue.includes(searchKeyword)) {
          return false;
        }

      }
      return true;
    })
  }
}