---
keyword: DynamicStylingPage
---

Dynamic styling can be applied to row (`tr`) or cell (`td`) elements. You have options to apply css styles or classes. 

## Dynamic Cell Styling

To specify cell class or style dynamically, specify the factory function in `BaseColumn.cellClass` or `BaseColumn.cellStyle`.

```typescript
{ field: 'name', 
  cellClass:(value, row) => row?.verified ? 'cell-verified' : '',
  cellStyle:(value, row) => row?.gender == 'M' ? 'color:red;' : ''
}
```
{{ NgDocActions.demo("DynamicCellStyleComponent") }}

## Dynamic Row Styling

To specify row class and style dynamically, define the logic in `RowOptions` object and pass it to the controller.

```typescript
controller = PanemuTableController.create<People>(this.columns, this.datasource, { 
  rowOptions: {
    rowClass: (row: People) => {
      return row.country == 'ID' ? 'indonesia' : '';
    },
    rowStyle: (row) => {
      return row.gender == 'F' ? 'color: red;' : '';
    }
  }});
```

In below example, Indonesian (country code ID) are bold and Female are red. Indonesian female are bold and red. When a row is selected the texts are underlined.

{{ NgDocActions.demo("DynamicRowStyleComponent") }}

## Changing Row Selection Style

In above example, the `selected-row` class is overriden as follow.

```scss
.panemu-table {
  
  tr.selected-row:nth-child(odd), tr.selected-row:nth-child(even) {
    background: inherit;
    color: inherit;
    text-decoration: underline;

    &:hover {
      background-color: inherit;
    }
  }
}
```

That style underline the selected row text.
