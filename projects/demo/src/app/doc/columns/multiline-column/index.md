---
keyword: MultilineColumnPage
---

By default, cell values are displayed as single lines. That is dictated by `.default-cell`
css class that exists in every cell.

Override that css class to make long values wrapped. Also specify the width of the column.

This css will make all columns support multiline.

```css
.panemu-table .default-cell {
  white-space: normal;
}
```

In below example, only Name column supports multiline.

{{ NgDocActions.demo("MultilineColumnnComponent") }}
