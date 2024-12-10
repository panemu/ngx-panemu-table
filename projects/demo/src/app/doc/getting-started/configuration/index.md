---
keyword: ConfigurationPage
---

To override default behavior, create a service extends `PanemuTableService`. For example:

```typescript file="../../../service/custom-panemu-table.service.ts"
```

Then use that class in global provider setting.

```typescript name="app.config.ts" {4}
export const appConfig: ApplicationConfig = {
  providers: [
    ...
    { provide: PanemuTableService, useClass: CustomPanemuTableService },
	...
  ],

};
```