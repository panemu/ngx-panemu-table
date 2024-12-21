---
keyword: CustomizationPage
---

By using NgxPanemuTable, you'll need to customize its behavior to match with your app such as Date and DateTime format,
how to display error to user, localisation, etc. Most of the default behaviors are provided by `PanemuTableService`. To override them, create a service extends `PanemuTableService`. For example:

```typescript file="../../../service/custom-panemu-table.service.ts"
```

Override methods you want to customize. Then use that class in global provider setting.

```typescript name="app.config.ts" {4}
export const appConfig: ApplicationConfig = {
  providers: [
    ...
    { provide: PanemuTableService, useClass: CustomPanemuTableService },
	...
  ],

};
```

If you also use inline-editing, you'll also need to create a `BaseEditingController` extends `PanemuTableEditingController`. You'll want to override at least 3 methods:
1. `showValidationError`: you can display a dialog or snackbar showing the validation error here.
2. `canReload`: if user cancel editing, ask for confirmation here.
3. `canDelete`: ask for confirmation if user really want to delete a data.

For more advanced scenario, you can specify custom cell editor. For example, instead of using `select`
component for `ColumType.MAP` column, you want to use a `typeahead`. For this purpose `PanemuTableEditingController.initCellEditorRenderer` is provided for you to override.

Fell free to [reach out to us](https://github.com/panemu/ngx-panemu-table/issues) if you're unsure how to
make it works to your liking.