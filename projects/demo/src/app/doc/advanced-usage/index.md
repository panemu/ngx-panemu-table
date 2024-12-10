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

