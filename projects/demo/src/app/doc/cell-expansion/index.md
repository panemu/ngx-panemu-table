---
keyword: CellExpansionPage
---

Cell Expansion is a feature to display any component or template under a row. The trigger is from a cell in which the column definition has `expansion` property defined. Below is the way to define an expansion:

```typescript
{ field: 'country', expansion: {
    //component or template defined using ng-template
    component: NestedTableComponent, 

    //optional. Put button at the start / end of the cell
    buttonPosition: 'end', 

    //optional. Call back to enable/disable expansion for each row
    isDisabled?: (row: People) => row.country !== 'Indonesia'
  }
}
```

Each columns can have an expansion. In below example, Email column has expansion to display a form to send an email. Country column has one to display detail table and Action column (the edit button) can display an edit form programmatically.

{{ NgDocActions.demo("RowDetailComponent") }}

The email is using `ng-template`. We can specify variables binding to relevant row, column and close function. For example:

```html
<ng-template #rowDetail1 let-row="row" let-column="column" let-close="close">
  <div class="grid grid-cols-[1fr_auto] gap-4 p-4 w-[300px]">

    <!-- Display email address -->
    <div class="col-span-2">Send {{column.label}} to {{row.email}}</div>
    ... 
    <!-- collapse the expansion when Send button is clicked -->
    <button (click)=close()>Send</button>
  </div>
</ng-template>
```

If using angular component, the component should implements `ExpansionRowRenderer` interface. The angular `@Input()` annotation is needed for `column`, `row` and `close` properties. Below is the source code of the Country cell expansion:

```typescript name="nested-table.component.ts" file="../../example/custom-cell/nested-table.component.ts" group="nested-table"

```

```html name="nested-table.component.html" file="../../example/custom-cell/nested-table.component.html" group="nested-table" 

```

Below is the code of the Edit People expansion:

```typescript name="people-form.component.ts" file="../../example/custom-cell/people-form.component.ts" group="people-form" 

```

```html name="people-form.component.html" file="../../example/custom-cell/people-form.component.html" group="people-form"

```