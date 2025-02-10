---
keyword: LocalisationPage
---

Localisation is done by overriding functionalities in `PanemuTableService`. Please refer to `*CustomizationPage` on how to set it up in regards with Angular Dependency Injection.

The service accept Angular `LOCALE_ID` global variable. Changing the default local will affect Date and DateTime cell formatter.

Texts displayed in NgxPanemuTable is using `LabelTranslation` interface. The default are:

```typescript file="../../../../../ngx-panemu-table/src/lib/option/default-label-translation.ts"

```

Notice the `searcForValueInColumn` has `{par0}` part. It is a variable that will be replaced by text entered in search input field.

One way to change some or all the translation is as follow:

```typescript file="../../service/custom-panemu-table.service.ts" {8,13-15,17-20}

```