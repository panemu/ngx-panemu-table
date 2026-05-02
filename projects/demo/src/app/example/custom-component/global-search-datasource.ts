import { CellFormatter, ColumnDefinition, PanemuTableDataSource, Predicate } from "ngx-panemu-table";

export class GlobalSearchDataSource<T> extends PanemuTableDataSource<T> {

  private formatters: { [key: string]: CellFormatter<any> } = {};

  constructor(columns: ColumnDefinition<T>) {
    super()
    this.formatters = columns.body.map(col => ({ [col.field]: col.formatter! })).reduce((acc, cur) => ({ ...acc, ...cur }), {});
  }

  protected override filter(result: T[], tableCriteria?: Predicate | null): T[] {
    if (!tableCriteria) {
      return result;
    }
    let searchKeyword = String((tableCriteria as any).value).toLowerCase();
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