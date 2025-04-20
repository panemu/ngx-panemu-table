---
keyword: CellRendererPage
---

This example shows advanced usage of custom cell renderer. It uses both `ng-template` and `CellComponent`
custom cell renderer.

{{ NgDocActions.demo("CustomCellRendererComponent") }}

The chart column uses the following component:


```typescript file="../../example/custom-cell/chart-cell.component.ts" 
```

Custom cell renderer can be applied to all columns of a table by specifying value for `DefaultColumnOptions.cellRenderer`.
The example of this use case is explained in `*GlobalSearchPage` page.

Please also take a look at `*CustomColumnPage` page for another example of using custom cell renderer.