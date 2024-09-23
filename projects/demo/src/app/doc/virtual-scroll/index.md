---
keyword: VirtualScrollPage
---

> **Warning**
> Virtual scroll is not compatible with variable row height (multiline cell and cell expansion).


Using `PanemuPaginationComponent` is preferred to work with huge data. Especially if the sorting, filtering and pagination is done in server side. However, if using pagination is not an option, you can enable virtual scroll. Only visible rows and a few more will be rendered in DOM. If user scrolls, the rows will be refreshed with relevant data.

To enable virtual scroll, pass `TableOptions` when creating a controller. You must also specify the row height in pixels. 

```typescript {4,5}
controller = PanemuTableController.create<People>(this.columns, 
  this.datasource,
  {
    virtualScroll: true,
    virtualScrollRowHeight: 32
  }
);
```


Below is an example of table with 10,000 rows with virtual scroll enabled. If it is not enabled, the browser will be very sluggish even crash.

{{ NgDocActions.demo("VirtualScrollComponent") }}