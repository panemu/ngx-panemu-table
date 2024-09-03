---
keyword: MapColumnPage
---

Specify type to `ColumnType.MAP`. Specify the `valueMap` property with key-value pair object or `Signal` of key-value pair.

```typescript {3}
columns = this.pts.buildColumns<Data>([
  //Using key value pair
  { field: 'last_login', type: ColumnType.MAP, valueMap: { F: 'Female', M: 'Male' }},
  
])
```

In the case of the data for the map is taken from server, use `Signal`:

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

