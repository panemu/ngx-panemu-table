---
keyword: BasicUsagePage
---

`PanemuTableController` provides a way of interacting with the grid. It requires 2 parameters:
1. List of columns. Use `PanemuTableService.buildColumns` method to create them. In most case, only `field` parameter is required. Field autocompletion is supported.

<img class="panel-shadow" src="assets/doc_image/field_auto_completion.png" alt="Field autocompletion" width="400px" style="display:block;" />

2. A function to get the data. For basic usage, in which the sorting, filtering and grouping are done in client side, use `PanemuTableDataSource`.

```typescript file="../../example/basic.component.ts"#L38-L45 {3}

```

In that snippet, the `autoHeight` property is set to true. It will displays all rows and the table height will adjust accordingly.

After that, pass the controller to `PanemuTableComponent`.

```html file="../../example/basic.component.html"#L1

```

Then call `PanemuTableController.reloadData` preferably in `ngOnInit` to render the data in the table.

> **Warning**
> Always call `PanemuTableController.reloadData` after setting data to datasource, or after changing controller's `criteria` and `groupByColumns` properties.

{{ NgDocActions.demo("BasicComponent") }}

When user click a column header, the sorting is handled by the datasource.

## Client Side Pagination

For more advanced scenario, the data is from server and then broken down into several pages by the datasource. `PanemuPaginationComponent` provide the UI that allows user to enter arbitrary range, i.e: 34-47, and move between pages by clicking the previous and next button. Simply add the following in the html template:

```html
...
<panemu-pagination [controller]="controller"/>
...
```

{{ NgDocActions.demo("PaginationComponent") }}

Clicking the previous button on the first page will go to the last page and vice versa. Above example also shows a glimpse of how to format data displayed in the table for example formatting Date, DateTime and Decimal.

## Client Side Grouping and Filtering

`PanemuTableDataSource` also supports client side grouping and filtering. The corresponding UI component to interact with this functionality is `PanemuQueryComponent`.

```html
<panemu-query [controller]="controller"></panemu-query>
```

{{ NgDocActions.demo("AllFeaturesClientComponent") }}

That example also shows how to set description of `gender` column in a delayed manner in scenario where the descriptions is taken from server.