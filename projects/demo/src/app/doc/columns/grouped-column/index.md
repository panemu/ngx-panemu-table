---
keyword: GroupedColumnPage
---

To group multiple columns under one cell header, use `'group'` type. It also requires `labels` and `children` properties to be specified. Nested groups is supported.

```typescript
{
   type: 'group', label: 'Biodata', children: [
      { field: 'name' },
      { field: 'gender' },
      { field: 'email' },
   ]
}
```

Nested group is supported. For example:

```typescript
{
   type: 'group', label: 'Other Data', children: [
      { field: 'country' },
      {
      type: 'group', label: 'Date Info', children: [
         { field: 'enrolled' },
         { field: 'last_login' },
      ]
      },
      { field: 'verified', type: 'boolean' },
   ]
}
```

{{ NgDocActions.demo("ColumnGroupComponent") }}