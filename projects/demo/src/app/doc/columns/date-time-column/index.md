---
keyword: DateTimeColumnPage
---

Specify type to `ColumnType.DATETIME`.

```typescript {3}
columns = this.pts.buildColumns<Data>([
  
  { field: 'last_login', type: ColumnType.DATETIME},
  
])
```

{{ NgDocActions.demo("DateTimeColumnComponent") }}

To set default format app-wide, override `PanemuTableService.getDateTimeCellFormatter`. Take a look at `*CustomizationPage` page
on how to apply it globally.