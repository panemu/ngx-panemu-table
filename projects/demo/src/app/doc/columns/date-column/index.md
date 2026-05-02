---
keyword: DateColumnPage
---

Specify type to `'date'`.

```typescript {3}
columns = this.pts.buildColumns<Data>([
  
  { field: 'enrolled', type: 'date' },
  
])
```

{{ NgDocActions.demo("DateColumnComponent") }}

To set default format app-wide, override `PanemuTableService.getDateCellFormatter`. Take a look at `*CustomizationPage` page
on how to apply it globally.