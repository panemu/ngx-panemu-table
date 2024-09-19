import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnGroupComponent } from './column-group.component';
import { DebugElement } from '@angular/core';

//ng test demo --include="projects/demo/src/app/example/column-group.component.spec.ts"

describe('ColumnGroupComponent', () => {
  let component: ColumnGroupComponent;
  let fixture: ComponentFixture<ColumnGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnGroupComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ColumnGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('check header group1', async () => {
    await fixture.whenStable(); //wait for controller.reloadData()
    fixture.detectChanges();//render the UI

    const componentDe: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = componentDe.nativeElement;
    const trList = componentEl.querySelectorAll('table thead tr');
    expect(trList.length).toBe(2);

    const firstThList = trList[0].querySelectorAll('th');
    expect(firstThList.length).toBe(6);

    expect(firstThList[0].getAttribute('rowspan')).toBe('2');
    expect(firstThList[0].getAttribute('colspan')).toBe('1');

    expect(firstThList[1].getAttribute('rowspan')).toBe('2');
    expect(firstThList[1].getAttribute('colspan')).toBe('1');

    expect(firstThList[2].getAttribute('rowspan')).toBe('1');
    expect(firstThList[2].getAttribute('colspan')).toBe('2');

    expect(firstThList[3].getAttribute('rowspan')).toBe('2');
    expect(firstThList[3].getAttribute('colspan')).toBe('1');

    expect(firstThList[4].getAttribute('rowspan')).toBe('1');
    expect(firstThList[4].getAttribute('colspan')).toBe('3');

    expect(firstThList[5].getAttribute('rowspan')).toBe('2');
    expect(firstThList[5].getAttribute('colspan')).toBe('1');

    const secondThList = trList[1].querySelectorAll('th');
    expect(secondThList.length).toBe(5);//9 hidden columns as a hack. 5 visisble

    secondThList.forEach(item => {
      expect(item.getAttribute('rowspan')).toBe('1');
      expect(item.getAttribute('colspan')).toBe('1');
    })


  })

  it('check header group2', async () => {
    await fixture.whenStable(); //wait for controller.reloadData()
    fixture.detectChanges();//render the UI

    const componentDe: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = componentDe.nativeElement;

    const btn = componentEl.querySelector('button[data-test-id="btn3"]') as HTMLElement;
    btn.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const trList = componentEl.querySelectorAll('table thead tr');
    expect(trList.length).toBe(3);

    const firstThList = trList[0].querySelectorAll('th');
    expect(firstThList.length).toBe(4);

    expect(firstThList[0].getAttribute('rowspan')).toBe('3');
    expect(firstThList[0].getAttribute('colspan')).toBe('1');

    expect(firstThList[1].getAttribute('rowspan')).toBe('1');
    expect(firstThList[1].getAttribute('colspan')).toBe('4');

    expect(firstThList[2].getAttribute('rowspan')).toBe('2');
    expect(firstThList[2].getAttribute('colspan')).toBe('3');

    expect(firstThList[3].getAttribute('rowspan')).toBe('3');
    expect(firstThList[3].getAttribute('colspan')).toBe('1');


    const secondThList = trList[1].querySelectorAll('th');
    expect(secondThList.length).toBe(3);

    expect(secondThList[0].getAttribute('rowspan')).toBe('2');
    expect(secondThList[0].getAttribute('colspan')).toBe('1');

    expect(secondThList[1].getAttribute('rowspan')).toBe('1');
    expect(secondThList[1].getAttribute('colspan')).toBe('2');

    expect(secondThList[2].getAttribute('rowspan')).toBe('2');
    expect(secondThList[2].getAttribute('colspan')).toBe('1');

    const thirdThList = trList[2].querySelectorAll('th');
    expect(thirdThList.length).toBe(5);

    thirdThList.forEach(item => {
      expect(item.getAttribute('rowspan')).toBe('1');
      expect(item.getAttribute('colspan')).toBe('1');
    })

  })

  it('check header nogroup', async () => {
    await fixture.whenStable(); //wait for controller.reloadData()
    fixture.detectChanges();//render the UI

    const componentDe: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = componentDe.nativeElement;

    const btn = componentEl.querySelector('button[data-test-id="btn1"]') as HTMLElement;
    btn.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const trList = componentEl.querySelectorAll('table thead tr');
    expect(trList.length).toBe(1);

    const firstThList = trList[0].querySelectorAll('th');
    expect(firstThList.length).toBe(9);
    firstThList.forEach(item => {
      expect(item.getAttribute('rowspan')).toBe('1');
      expect(item.getAttribute('colspan')).toBe('1');
    })
  })
});
