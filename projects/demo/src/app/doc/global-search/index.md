---
keyword: GlobalSearchPage
---

The behavior of client side search functionality can be customized by overriding
`PanemuTableDataSource.filter`. In below example, the search is applied to all columns based on the text
displayed on the table. You can search on string, number, date, and datetime columns as displayed on the table.

{{ NgDocActions.demo("GlobalSearchComponent") }}

That example uses custom pagination component explained in `*CustomPaginationPage` page.

Below is the code of the datasource.

```typescript name="global-search-datasource.ts" file="../../example/custom-component/global-search-datasource.ts"

```

Below is an example of how to implement per-column search with search field in every column header.

{{ NgDocActions.demo("ColumnSearchComponent") }}

```typescript name="column-search-datasource.ts" file="../../example/custom-component/column-search-datasource.ts"

```