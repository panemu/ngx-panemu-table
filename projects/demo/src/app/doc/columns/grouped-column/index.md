---
keyword: GroupedColumnPage
---

To group multiple columns under one cell header, use `ColumnType.GROUP` type. It also requires `labels` and `children` properties to be specified. Nested groups is supported.

```typescript
{
   type: ColumnType.GROUP, label: 'Biodata', children: [
      { field: 'name' },
      { field: 'gender' },
      { field: 'email' },
   ]
}
```

Nested group is supported. For example:

```typescript
{
   type: ColumnType.GROUP, label: 'Other Data', children: [
      { field: 'country' },
      {
      type: ColumnType.GROUP, label: 'Date Info', children: [
         { field: 'enrolled' },
         { field: 'last_login' },
      ]
      },
      { field: 'verified' },
   ]
}
```

{{ NgDocActions.demo("ColumnGroupComponent") }}