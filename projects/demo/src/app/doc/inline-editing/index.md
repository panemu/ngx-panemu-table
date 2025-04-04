---
keyword: InlineEditingPage
---

To activate inline editing, the table first needs to know how to save or delete data. Create
a new class extending `PanemuTableEditingController`. Override the `saveData` and `deleteData` methods
and put your logic there.

```
class SampleEditingController extends PanemuTableEditingController<DataModel> {
  override saveData(data: DataModel[], tableMode: TABLE_MODE): Observable<DataModel[]> {
    // Call your API to save here. Check the value of tableMode beforehand.
    // It could be either 'insert' or 'edit'.

    // You need to return Observable<DataModel[]>, which could be from the API you call
    // or just something like of(data). The returned data will be displayed
    // on the table. So server-side-generated values like id can be displayed after save.
  }

  override deleteData(data: DataModel): Observable<any> {
    // Call delete API here. Return any observable so that the table knows when
    // the process finishes.
  }
}
```

After that, set the editing controller to the table controller:
```
this.controller.editingController = new SampleEditingController();
```

The controller has some methods regarding this feature:
1. `PanemuTableController.edit`
2. `PanemuTableController.insert`
3. `PanemuTableController.save`
4. `PanemuTableController.deleteSelectedRow`
5. `PanemuTableController.reloadCurrentPage` to cancel editing and return to `browse` mode.

That's a start to just activate inline-editing. But there is so much more!

{{ NgDocActions.demo("InlineEditing1Component") }}

> **Warning**
> The toolbar in the examples is not part of the library. It is up to you to create
> the necessary UI to support the editing.

The component used as a cell editor depends on the `ColumnType` of the column. It is customizable.

## Angular Reactive Form

Angular Reactive Form is the backbone of inline-editing. It supports FormControl, FormGroup, and FormArray.
In the example below, the Address column is a combination of Street and Zip Code. So we are going to use FormGroup
to handle Address editing.

```typescript
  form: { [f in keyof Required<any>]: () => AbstractControl | undefined } = {
    id: () => undefined,
    name: () => new FormControl('', { updateOn: 'blur', validators: [Validators.required, Validators.maxLength(15), Validators.minLength(5)] }),
    address: () => new FormGroup(
      {
        street: new FormControl('', { validators: [Validators.maxLength(50)] }),
        zipCode: new FormControl('', { validators: [Validators.maxLength(5), Validators.minLength(5)] })
      },
      { validators: this.addressValidator() }
    )
  }

  override createFormControl(field: keyof any, rowData: any, tableMode: TABLE_MODE): AbstractControl | null | undefined {
    return this.form[field.toString()]?.();
  }
```

{{ NgDocActions.demo("InlineEditing2Component") }}

You've noticed that we override the `createFormControl` method to specify AbstractControl for each column.
We can also specify the validations here. **Always return a new AbstractControl every time because each row
will have its own set of FormControls**. If a cell doesn't have a FormControl, then it is not editable.

That example also shows how to create a custom cell editor, in this case is `AddressCellEditor`. The source code is at the bottom of this page.

## Listening To Cell Edit

In the example below, the Country and City cells are logically connected. If the user selects a country, the options
in City are updated. It is achieved by overriding `PanemuTableEditingController.onCommitEdit`. Also this table is
on edit mode initially.

{{ NgDocActions.demo("InlineEditing3Component") }}

## Managing Editable Cells

If we want to make a cell permanently not editable, we can return `undefined` in `createFormControl` for 
that column. But what if we want to make a cell not editable based on the value of another cell?
Here is the example:

{{ NgDocActions.demo("InlineEditing4Component") }}

The *Verified At* column is editable if the *Registered* value is **Yes**. We put logic in `onCommitEdit` and `onStartEdit`
to make it happen.

## Custom Editor

This example displays the `amount` field in 3 columns. One with the default editor, the second without an editor, and the third with
a custom editor. There is a logic in `initCellEditorRenderer` that inspects the **__key** of the column and acts
accordingly. We can't use `field` here because all 3 columns have the same `field`.

{{ NgDocActions.demo("InlineEditing6Component") }}

A custom cell editor must implement `CellEditorComponent`. Then override the `PanemuTableEditingController.initCellEditorRenderer` method and use it in `renderer.component`.

```typescript
override initCellEditorRenderer(renderer: CellEditorRenderer<CustomData>, column: PropertyColumn<CustomData>): CellEditorRenderer<CustomData> | null {
  if (column.__key == 'amount_1') {
    return null;
  } else if (column.__key == 'amount_2') {
    renderer.component = CustomAmountEditor;
  }
  return renderer;
}
```

## Disabled sorting, filtering, grouping and pagination

The included pagination and query component listen to table's mode. If table is not in `browse` mode, they are disabled.

{{ NgDocActions.demo("InlineEditing7Component") }}

## Summary
There are 3 `TABLE_MODE`s: browse, edit, insert.

INSERT and EDIT mode:
- Cell editors are only displayed when the respective row is selected.
- Developers can specify which columns are editable for each row.
- It is possible to put validators at the cell level using Angular FormControl or at the row level by overriding the `canSave` method.
- Cells with invalid values will have a red bottom border.
- Upon successful save, the mode changes to 'browse'.
- Save is rejected if there are invalid values.
- Changed rows have a light-yellow background. Changed cells have a darker-yellow background.
- The editing is powered by Angular Reactive Form. Each edited row has a FormGroup.
- Pagination and Query components are disabled during editing. Sorting functionality too. This is to avoid
unsaved data loss.
- Call `PanemuTableController.reloadCurrentPage` to cancel editing and return to `browse` mode.

INSERT MODE:
- Call `PanemuTableController.insert` to enter `insert` mode and add a new row.
- The new row is always put at the top.
- Only newly inserted rows can be selected. So users can't edit persisted data.
- Users can delete newly inserted rows. The persisted rows can't be deleted because they aren't selectable.
- If all new rows are deleted, the mode automatically changes to browse.
- All newly inserted rows are included in the save method.

EDIT MODE:
- Call `PanemuTableController.edit` to enter `edit` mode, then users can select a row to edit.
- Only rows with changed cells will be included in the save method.

### Additional Source Code

#### Toolbar

```typescript file="../../example/inline-editing/toolbar.component.ts" group="toolbar" name="toolbar.component.ts"

```
```html file="../../example/inline-editing/toolbar.component.html" group="toolbar" name="toolbar.component.html"

```

#### Address (FormGroup) Cell Editor

```typescript file="../../example/inline-editing/address-cell-editor.ts" group="address-cell-editor" name="address-cell-editor.ts"

```
```html file="../../example/inline-editing/address-cell-editor.html" group="address-cell-editor" name="address-cell-editor.html"

```
```scss file="../../example/inline-editing/address-cell-editor.scss" group="address-cell-editor" name="address-cell-editor.scss"

```

#### Custom Amount Editor using Slider

```typescript file="../../example/inline-editing/custom-amount-editor.ts"

```

#### Message Dialog

```typescript file="../../example/message-dialog/message-dialog.component.ts" group="message-dialog" name="message-dialog.component.ts"

```
```html file="../../example/message-dialog/message-dialog.component.html" group="message-dialog" name="message-dialog.component.html"

```
```scss file="../../example/message-dialog/message-dialog.component.scss" group="message-dialog" name="message-dialog.component.scss"

```
```typescript file="../../example/documentation.service.ts" group="message-dialog" name="documentation.service.ts"

```