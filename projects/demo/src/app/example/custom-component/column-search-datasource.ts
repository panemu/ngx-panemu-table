import { CellFormatter, ColumnDefinition, PanemuTableDataSource, Predicate } from "ngx-panemu-table";

export class ColumnSearchDataSource<T> extends PanemuTableDataSource<T> {

  private formatters: { [key: string]: CellFormatter<any> } = {};

  constructor(columns: ColumnDefinition<T>) {
    super()
    this.formatters = columns.body.map(col => ({ [col.field]: col.formatter! })).reduce((acc, cur) => ({ ...acc, ...cur }), {});
  }

  protected override filter(result: T[], tableCriteria?: Predicate | null): T[] {
    if (!tableCriteria) {
      return result;
    }
    return result.filter((item: any) => {
      // for (const crit of tableCriteria) {
      //   let searchKeyword = String(crit.value).toLowerCase();
      //   let formattedValue = String((this.formatters[crit.field](item[crit.field]) ?? '')).toLowerCase();
      //   if (!formattedValue.includes(searchKeyword)) {
      //     return false;
      //   }

      // }
      return true;
    })
  }
}