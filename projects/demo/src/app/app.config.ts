import { provideNgDocApp, provideSearchEngine, NgDocDefaultSearchEngine, providePageSkeleton, NG_DOC_DEFAULT_PAGE_SKELETON, provideMainPageProcessor, NG_DOC_DEFAULT_PAGE_PROCESSORS } from "@ng-doc/app";
import { NG_DOC_ROUTING, provideNgDocContext } from "@ng-doc/generated";
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideClientHydration } from '@angular/platform-browser';
import { PanemuTableService } from "ngx-panemu-table";
import { CustomPanemuTableService } from "./service/custom-panemu-table.service";
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
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
