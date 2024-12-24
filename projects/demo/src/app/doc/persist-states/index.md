---
keyword: PersistStatesPage
---

To activate the save table states feature, specify the `TableOptions.stateKey` when instantiating table controller.

```typescript {4}
controller = PanemuTableController.create<People>(
	this.columns, 
	this.datasource, 
	{ stateKey: 'this_key_must_be_unique_app_wide' });
```

The `stateKey` should be unique app-wide to avoid collition. By default it is saved to browser's local storage.

Try to change the following states on below example:
- Resize columns width. Or click the cog button and select *Setting* to change columns visibility, position
and stickiness.
- Click some row headers to sort.
- Specify search criteria and grouping.
- Change the pagination range/page.

Then go to other page and back. The last states should be restored.

{{ NgDocActions.demo("PersistStateComponent") }}

> **Warning**
> If columns structure changes (columns added, removed or there is a change in `ColumnType.GROUP` children)
the saved state is ignored. See `TableState.structureKey`.

By default the states are stored in browser's local storage. If you want to store it in database server,
in your [custom table service](getting-started/configuration), override these methods:

1. `PanemuTableService.saveTableState`.
2. `PanemuTableService.getTableState`. Should returns `Observable<TableState>`.
3. `PanemuTableService.deleteTableState`. Should returns `Observable`. By default, after the delete
succeed, the page is reloaded.

Persisting state is best combined with `PanemuSettingComponent`. It provides a button to clear or reset the state.
To delete the states programmatically, call `PanemuTableController.deleteState`. The controller also has 
`saveState()` method.