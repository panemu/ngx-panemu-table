---
keyword: ConfigurationPage
---

To override default behavior, create a service extends `PanemuTableService`. For example:

```typescript
import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { CellFormatter, LabelTranslation, PanemuTableService } from 'ngx-panemu-table';

@Injectable({providedIn: 'root'})
export class CustomPanemuTableService extends PanemuTableService {
  
	constructor(@Inject(LOCALE_ID) locale: string) { 
    super(locale)
  }

  override getDateCellFormatter(): CellFormatter {
    return (val) => {
      return formatDate(val, 'd MMM yyyy', this.locale) || ''
    }
  } 

  override getLabelTranslation(labelKey: keyof LabelTranslation): string {
    if (labelKey == 'loading') {
      return 'Retrieving data...'
    }
    return super.getLabelTranslation(labelKey)
  }
  
}
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