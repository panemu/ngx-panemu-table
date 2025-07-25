import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  NgDocNavbarComponent,
  NgDocSidebarComponent,
  NgDocThemeToggleComponent,
} from '@ng-doc/app';
import { NgDocRootComponent } from '@ng-doc/app/components/root';
import {
  NgDocButtonIconComponent,
  NgDocIconComponent,
  NgDocTooltipDirective,
} from '@ng-doc/ui-kit';
import { preventInitialChildAnimations } from '@ng-doc/ui-kit/animations';

@Component({
    animations: [preventInitialChildAnimations],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        NgDocRootComponent,
        NgDocNavbarComponent,
        RouterLink,
        NgDocButtonIconComponent,
        NgDocTooltipDirective,
        NgDocIconComponent,
        NgDocSidebarComponent,
        RouterOutlet
    ]
})
export class AppComponent {
  protected readonly location = inject(Location);


  @HostBinding('attr.data-ng-doc-is-landing')
  get isLandingPage(): boolean {
    return this.location.path() === '';
  }
}