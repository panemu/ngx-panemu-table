---
keyword: InstallationPage
---

Create a new angular project:

```
ng new test-ngx-panemu-table
cd test-ngx-panemu-table
```


Install ngx-panemu-table with this command.

```
npm i ngx-panemu-table
```

Open the main style file. Usually `src/styles.scss` or `src/styles.css`. Add these lines:

```css name="styles.scss"
@import '../node_modules/ngx-panemu-table/styles/indigo-pink.css';
@import '../node_modules/ngx-panemu-table/styles/main.css';
```

> **Warning**
> If your project uses Angular Material, you don't need to import `indigo-pink.css`

Ensure `provideAnimations()` is in `app.config.ts` provider array. If it's not there, please add it.

```typescript name="app.config.ts" {1,6}
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    ...
    provideAnimations()
    ...
  ]
};
```

Delete the content of `app.component.ts` and paste the following code.

```typescript name="app.component.ts"
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';

interface People {
  id: number
  name: string
  email?: string
  gender: string
  enrolled: string
  country: string | null
  amount: number
  last_login: string
  verified: boolean
}

const DATA: People[] = [
  {"id":1,"name":"Abagail Kingscote","email":"akingscote0@imdb.com","gender":"F","enrolled":"2023-04-26","country":"Philippines","amount":9339.72,"last_login":"2024-07-03 09:56:29","verified":true},
  {"id":2,"name":"Nicolina Coit","email":"ncoit1@vk.com","gender":"M","enrolled":"2023-11-01","country":"Kazakhstan","amount":3744.95,"last_login":"2024-04-29 12:48:59","verified":false},
  {"id":3,"name":"Sarene Greim","email":"sgreim2@seesaa.net","gender":"M","enrolled":"2023-01-03","country": null,"amount":4397.68,"last_login":"2024-06-03 13:14:23","verified":true},
  {"id":4,"name":"Blair Millbank","gender":"F","enrolled":"2023-07-01","country":"Philippines","amount":3334.58,"last_login":"2024-06-18 12:06:58","verified":false},
  {"id":5,"name":"Kliment Sprowle","email":"ksprowle4@alexa.com","gender":"M","enrolled":"2023-12-25","country":"Indonesia","amount":6459.93,"last_login":"2024-04-24 03:46:26","verified":true}
]

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
 /**
  * We can instantiate PanemuTableService in constructor 
  * if tsconfig.json `useDefineForClassFields` is set to false
  */
  pts = inject(PanemuTableService);

  columns = this.pts.buildColumns<People>([
    { field: 'id' },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender' },
    { field: 'country' },
    { field: 'amount' },
    { field: 'enrolled' },
    { field: 'last_login' },
    { field: 'verified'}
  ]);

  controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA));
  
  constructor() { }
  
  ngOnInit() {
    this.controller.reloadData();
  }
}
```

Replace the content of `app.component.html` with this code:

```html name="app.component.ts"
<div style="height: 90vh; display: flex; flex-direction: column;">
  <div style="display: flex; justify-content: space-between;">
    <panemu-query [controller]="controller" />
    <panemu-pagination [controller]="controller" />
  </div>
  <div style="flex-grow: 1; margin-top: 8px;">
    <panemu-table [controller]="controller" />
  </div>
</div>
```

Run the application:

```
npm start
```

Go ahead open a browser and access `http://localhost:4200`.

Please report any problem to [our repository](https://github.com/panemu/ngx-panemu-table/issues).

Thank you for using NgxPanemuTable. We'd appreciate a star in [github](https://github.com/panemu/ngx-panemu-table).
