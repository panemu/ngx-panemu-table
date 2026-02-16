import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { NG_DOC_DEFAULT_PAGE_PROCESSORS, NG_DOC_DEFAULT_PAGE_SKELETON, NgDocDefaultSearchEngine, provideMainPageProcessor, provideNgDocApp, providePageSkeleton, provideSearchEngine } from "@ng-doc/app";
import { NG_DOC_ROUTING, provideNgDocContext } from "@ng-doc/generated";

import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(NG_DOC_ROUTING, withInMemoryScrolling({ scrollPositionRestoration: "enabled", anchorScrolling: "enabled" })),
    provideHttpClient(withInterceptorsFromDi(), withFetch()), 
    provideNgDocContext(), 
    provideNgDocApp(), 
    provideSearchEngine(NgDocDefaultSearchEngine), 
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON), 
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS),
    // { provide: PanemuTableService, useClass: CustomPanemuTableService }
  ],

};
