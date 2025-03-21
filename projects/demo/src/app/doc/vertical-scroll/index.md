---
keyword: VerticalScrollPage
---

By default vertical scroll is enabled. The table takes its container space. So the container must have the height harcoded or takes its parent available spaces.

If your use case is to display a few data, it is better to set the `autoHeight` property to true. The height will be adjusted automatically to make all rows visible. 

```typescript {5}
controller = PanemuTableController.create(
  this.columns,
  new PanemuTableDataSource(DATA),
  { 
    autoHeight: true 
  }
);
```

This basic example displays all rows by enabling the `autoHeigh` thus disabling vertical scrolling.


{{ NgDocActions.demo("BasicComponent", {inputs: {showAddRowButton: "true"} }) }}

Below is the example of the table taking remaining vertical spaces.

{{ NgDocActions.demo("VerticalScrollComponent") }}