---
keyword: CustomRowGroupPage
---

{{ NgDocActions.demo("CustomRowGroupComponent") }}

Above example shows how to customize row grouping component.
1. Default RowGroup: no special code needed. It uses `DefaultRowGroupRenderer` from NgxPanemuTable. No footer by default.
2. Custom Template: It uses `DefaultRowGroupRenderer` however the content is replaced with `ng-template`.
The button to expand the row is kept as is. The pagination is hidden by a flag.  Also in this example, it has a footer from an `ng-template`.
3. Custom Content Component: It still uses `DefaultRowGroupRenderer` however the content is a component
implementing `RowGroupContentComponent` interface. It is more reusable than using `ng-template` above.

```typescript file="../../example/custom-row-group/boolean-row-group-content.component.ts" name="boolean-row-group-content.component.ts"
```

4. Custom Component: It uses custom component implements `RowGroupComponent`. You have total control to the
`td` elements and what to show in them. However, it is required to set the display css property to `contents`.

```css
:host {
	display: contents;
}
```


```typescript file="../../example/custom-row-group/country-row-group.component.ts" name="country-row-group.component.ts" group="g1"
```

```html file="../../example/custom-row-group/country-row-group.component.html" name="country-row-group.component.html" group="g1"
```

> **Warning**
> When creating custom `RowGroupComponent` or `RowGroupFooterComponent` ensure to set the `:host` css display property to `contents`. 

## All Expanded Groups

It is possible to display data all at once with grouping as a way to categorize the data. In this scenario, we need to structure the table rows manually. Insert `RowGroup` or `RowGroupFooter` as needed in the `TableData.rows` as can be seen in below example.

{{ NgDocActions.demo("CustomRowGroup2Component") }}