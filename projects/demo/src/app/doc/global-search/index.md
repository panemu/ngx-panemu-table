---
keyword: GlobalSearchPage
---

## All Columns Search

The behavior of client side search functionality can be customized by overriding
`PanemuTableDataSource.filter`. In below example, the search is applied to all columns based on the text
displayed on the table. You can search on string, number, date, and datetime columns as displayed on the table.

{{ NgDocActions.demo("GlobalSearchComponent") }}


That example uses custom pagination component explained in `*CustomPaginationPage` page.

Below is the code of the datasource.

```typescript name="global-search-datasource.ts" file="../../example/custom-component/global-search-datasource.ts"

```

That example also uses custom `CellRenderer` to hight light texts matching search term.

```typescript name="highlight-cell-renderer.ts" file="../../example/custom-component/highlight-cell-renderer.ts" group="highlight-cell-renderer"

```
```html name="highlight-cell-renderer.html" file="../../example/custom-component/highlight-cell-renderer.html" group="highlight-cell-renderer"

```
```typescript name="highlight.pipe.ts" file="../../example/custom-component/highlight.pipe.ts" group="highlight-cell-renderer"

```

## Per Column Search

Below is an example of how to implement per-column search with search field in every column header.

{{ NgDocActions.demo("ColumnSearchComponent") }}

```typescript name="column-search-datasource.ts" file="../../example/custom-component/column-search-datasource.ts"

```

```typescript name="header-filter.component.ts" file="../../example/custom-component/header-filter.component.ts" group="header-filter"

```
```html name="header-filter.component.html" file="../../example/custom-component/header-filter.component.html" group="header-filter" 

```