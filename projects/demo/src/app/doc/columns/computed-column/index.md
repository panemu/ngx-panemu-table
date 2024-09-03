---
keyword: ComputedColumnPage
---

Computed column doesn't have predefined way to know what value to display in it cells. It is our job to define it.
Computed column has `ColumnType.COMPUTED` type. It doesn't have `field` property. Insted, we have to specify `formatter`
property containing logic about what to display in the cell.


```typescript
{
  //specify the type is COMPUTED
  type: ColumnType.COMPUTED, 

  //Specify what to display in the cell
  formatter: (val: any, rowData?: any) => rowData['gender'] + ' - ' + rowData['country'],
  
}

```
The gray and red columns below are computed.

{{ NgDocActions.demo("ComputedComponent") }}