---
keyword: CustomColumnPage
---

To create custom column, specify the value of `BaseColumn.cellRenderer` to your own component or an `ng-template`.

{{ NgDocActions.demo("CustomCellComponent") }}

Above example has 3 custom columns:

1. Gender column. It uses `ng-template` defined in the html file.
2. Country column. It uses Angular component. When its button is clicked, the table will be filtered by corresponding country.

```typescript file="../../../example/custom-cell/filter-country-cell.component.ts" name="filter-country-cell.component.ts" group="g1"
```

```html file="../../../example/custom-cell/filter-country-cell.component.html" name="filter-country-cell.component.html" group="g1"
```

3. Action column. It uses `ng-template` and is sticky to the right.