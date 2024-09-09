import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Inject, Output } from '@angular/core';
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, map, skip, switchMap, takeUntil, tap, } from 'rxjs/operators';

@Directive({
  selector: '[resizable]',
  standalone: true
})
export class ResizableDirective {
  @Output() onStart = new EventEmitter
  @Output()
  readonly resizable = fromEvent<MouseEvent>(
    this.elementRef.nativeElement,
    'mousedown'
  ).pipe(
    tap((e) => {
      this.onStart.emit()
      e.preventDefault()
    }),
    switchMap(() => {
      const { width, right } = this.elementRef.nativeElement
        .closest('th')!
        .getBoundingClientRect();

      return fromEvent<MouseEvent>(this.documentRef, 'mousemove').pipe(
        map(({ clientX }) => {
          return clientX - right + 6
        }),
        distinctUntilChanged(),
        takeUntil(fromEvent(this.documentRef, 'mouseup'))
      );
    })
  );

  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef<HTMLElement>
  ) { }
}