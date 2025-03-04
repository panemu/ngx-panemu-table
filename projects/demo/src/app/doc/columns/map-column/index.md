---
keyword: MapColumnPage
---

`MapColumn` is similar to combobox in a way that the displayed data is not the actual value. There is a `map` that
translate the actual value to displayed value. To use it, specify the column type to `ColumnType.MAP`. Then set `valueMap` property with key-value pair object or `Signal` of key-value pair.

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
  { field: 'last_login', type: ColumnType.MAP, valueMap: this.genderMap},
])

ngOnInit() {
	this.genderMap.set({ F: 'Girl', M: 'Boy' })
}
```

{{ NgDocActions.demo("MapColumnComponent") }}

