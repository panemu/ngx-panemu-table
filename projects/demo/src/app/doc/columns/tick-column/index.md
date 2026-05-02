---
keyword: TickColumnPage
---

A tick column renders a checkbox per row for selection. Create one by adding a column with `type: 'tick'` and assigning a `TickColumnController` instance. The controller exposes methods to tick/untick rows programmatically and a signal to read the current selection.

```ts
const tickCtrl = new TickColumnController<People>();

const columns = pts.buildColumns<People>([
  { type: 'tick', controller: tickCtrl },
  { field: 'name' },
  // ...
]);

// later
tickCtrl.setTicked(true, row);
tickCtrl.setTickedAll(false);
const selected = tickCtrl.tickedRowsSignal(); // readonly signal of T[]
```

The following sample shows the same pattern with two tick columns. Provided customisations are:
1. Show/hide the tick-all checkbox in the header (`checkBoxHeader`).
2. Disable tick on a row basis (`isDisabled`).


{{ NgDocActions.demo("TickableRowComponent") }}
