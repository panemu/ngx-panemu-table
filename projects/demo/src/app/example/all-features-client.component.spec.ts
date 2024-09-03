import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AllFeaturesClientComponent } from './all-features-client.component';
import { DebugElement } from '@angular/core';

//ng test demo --include="projects/demo/src/app/example/all-features-client.component.spec.ts"

describe('AllFeaturesClientComponent', () => {
  let component: AllFeaturesClientComponent;
  let fixture: ComponentFixture<AllFeaturesClientComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
			imports: [AllFeaturesClientComponent],
			providers: [provideHttpClient()]
		}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllFeaturesClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

	it('should has data', async () => {
		await fixture.whenStable();
		const data = [...component.datasource.getAllData()];
		expect(data?.length).toBeTruthy();
    
    fixture.detectChanges();//render the UI

		//======== Check initial grouping and filtering
		const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;
    let groupChip = componentEl.querySelector('.panemu-query .group .chip-label');
    const filterChip = componentEl.querySelector('.panemu-query .filter .chip-label');

    
    expect(groupChip?.textContent).toBe('Country');
    expect(filterChip?.textContent).toBe('Verified: true');
    const countries = new Set(data.filter(item => item.verified).map(item => item.country));
    expect(component.controller.getData().length).toBe(countries.size);

    //=== Remove grouping
    const button = componentEl.querySelector('.panemu-query .group.chip-panel button') as HTMLElement;
    button!.click();
    fixture.detectChanges();

    //group chip should be gone
    groupChip = componentEl.querySelector('.panemu-query .group .chip-label');
    expect(groupChip).toBeFalsy();

    //displayed data should be 100
    expect(component.controller.getData().length).toBe(100);
    expect(componentEl.querySelectorAll('table tbody tr').length).toBe(100);
	})
})