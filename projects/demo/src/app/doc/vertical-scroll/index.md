---
keyword: VerticalScrollPage
---

By default vertical scroll is enabled. You have to make space for the table either by hardcoding the container height or make the table take all remaining vertical spaces.

If your use case is to display a few data, it is better to disable the vertical scroll. The height will be adjusted automatically to make all rows visible. 

```typescript {3}
<panemu-table 
	[controller]="controller" 
	[verticalScroll]="false"
/>
```

For example:

{{ NgDocActions.demo("BasicComponent") }}

Below is the example of the table taking remaining vertical spaces.

{{ NgDocActions.demo("VerticalScrollComponent") }}