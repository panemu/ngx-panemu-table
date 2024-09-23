---
keyword: MapColumnPage
---

`MapColumn` is similar to combobox in a way that the displayed data is not the actual value. There is a `map` that
translate the actial value to display value. To use it, specify the column type to `ColumnType.MAP`. Then set `valueMap` property with key-value pair object or `Signal` of key-value pair.

```typescript {3}
columns = this.pts.buildColumns<Data>([
  //Using key value pair
  { field: 'last_login', type: ColumnType.MAP, valueMap: { F: 'Female', M: 'Male' }},
  
])
```

If the value map is retrieved asynchronously or later after table initialization, use `Signal`:

```typescript
genderMap = signal<any>({});

columns = this.pts.buildColumns<Data>([
  { field: 'last_login', type: ColumnType.MAP, valueMap: { F: 'Female', M: 'Male' }},
])

ngOnInit() {
	this.genderMap.set({ F: 'Girl', M: 'Boy' })
	this.controller.refreshTable();
}
```

{{ NgDocActions.demo("MapColumnComponent") }}

