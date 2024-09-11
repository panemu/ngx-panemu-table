---
keyword: LocalisationPage
---

Localisation is done by overriding functionalities in `PanemuTableService`. Please refer to `*ConfigurationPage` on how to set it up in regards with Angular Dependency Injection.

The service accept Angular `LOCALE_ID` global variable. Changing the default local will affect Date and DateTime cell formatter.

Texts displayed in NgxPanemuTable is using `LabelTranslation` interface. The default are:

```typescript
DEFAULT_LABEL_TRANSLATION: LabelTranslation = {
  search: 'Search',
  loading: 'Loading...',
  day: 'Day',
  month: 'Month',
  year: 'Year',
  groupBy: 'Group By',
  noData: 'No data to display',
  searcForValueInColumn: 'Search for "{par0}" in:'
};
```

Notice the `searcForValueInColumn` has `{par0}` part. It is a variable that will be replaced by text entered in search input field.

One way to change some or all the translation is as follow:

```typescript file="../../service/custom-panemu-table.service.ts" {8,13-14,17-19}

```