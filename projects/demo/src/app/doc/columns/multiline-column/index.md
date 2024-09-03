---
keyword: MultilineColumnPage
---

By default, cell values are displayed as single lines. If a value is too long to fit within the cell, an ellipsis (...) is shown. That is dictated by `.default-cell`
css class that by default exists in every cell.

Override that css class to make long values wrapped. Also specify the width of the column. For example:

```css
.panemu-table .default-cell {
  white-space: normal;
}
```

{{ NgDocActions.demo("MultilineColumnnComponent") }}
