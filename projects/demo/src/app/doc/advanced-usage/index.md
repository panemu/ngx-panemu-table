---
keyword: AdvancedUsagePage
---

`PanemuTable` supports various complex usage such as server side data processing, dynamic row style, dynamic cell style, custom cell header etc.

## Server Side Pagination, Sorting, Filtering and Grouping

This functionality requires server API that support pagination, sorting, filtering and grouping. `PanemuTabelController` provide a way to propagate required parameters
to the server.

Create an instance of `PanemuTableController` with custom datasource by calling static method `PanemuTableController.createWithCustomDataSource`. The role of `PanemuTableDataSource` is replaced with custom function accepting 3 parameters:
1. `startIndex`: zero based index for pagination.
2. `maxRows`: number of rows displayed in one page
3. `tableQuery`: contain grouping, sorting and filtering information that the server should handle.

The method should returns `TableData` observable.

```typescript
controller = PanemuTableController.createWithCustomDataSource<People>(
  this.columns, 
  this.retrieveData.bind(this)
);
...
...
constructor(private dataService: DataService, private pts: PanemuTableService){}

private retrieveData(startIndex: number, maxRows: number, tableQuery: TableQuery): Observable<TableData<T>> {
  return this.dataService.getMockedServerData(startIndex, maxRows, tableQuery)
}
```

{{ NgDocActions.demo("AllFeaturesServerComponent") }}

## Dynamic Row Styling

To specify row class and style dynamically, define the logic in `RowOptions` object and pass it to the controller.

```typescript
controller = PanemuTableController.create<People>(this.columns, this.datasource, {
  
  rowClass: (row: People) => row.country == 'Indonesia' ? 'indonesia' : '',
  
  rowStyle: (row) => {
    if (row.gender == 'F') return 'color: red;'
    return '';
  }
});
```

In below example, Indonesian are bold and Female are red. Indonesian female are bold and red. When a row is selected
the texts are underlined.

{{ NgDocActions.demo("DynamicRowStyleComponent") }}

## Changing Row Selection Style

In above example, the `selected-row` class is overriden as follow.

```scss
.panemu-table {
  
  tr.selected-row, tr.selected-row:nth-child(2n) {
    background: inherit;
    color: inherit;
    text-decoration: underline;

    &:hover {
      background-color: inherit;
    }
  }
}
```

That style underline the selected row text.

## Dynamic Cell Styling

To specify cell class or style dynamically, specify the factory function in `BaseColumn.cellClass` or `BaseColumn.cellStyle`.

{{ NgDocActions.demo("DynamicCellStyleComponent") }}