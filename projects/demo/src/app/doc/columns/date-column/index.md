---
keyword: DateColumnPage
---

Specify type to `ColumnType.DATE`.

```typescript {3}
columns = this.pts.buildColumns<Data>([
  
  { field: 'enrolled', type: ColumnType.DATE },
  
])
```

{{ NgDocActions.demo("DateColumnComponent") }}

To set default format app-wide, override `PanemuTableService.getDateCellFormatter`. Take a look at `*ConfigurationPage` page
on how to apply it globally.