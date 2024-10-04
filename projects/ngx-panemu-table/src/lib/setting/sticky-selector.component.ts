import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, debounceTime, skip } from 'rxjs';
import { BaseColumn, StickyType } from '../column/column';
import { CommonModule } from '@angular/common';
import { PanemuTableService } from '../panemu-table.service';

@Component({
  selector: 'sticky-selector',
  templateUrl: 'sticky-selector.component.html',
  standalone: true,
  imports: [CommonModule]
})

export class StickySelectorComponent implements OnInit {
  @Input({ required: true }) column!: BaseColumn<any>;
  @Output() onRequestLayout = new EventEmitter;
  pts = inject(PanemuTableService)
  labelTranslation = this.pts.getLabelTranslation()
  stickyObservable$ = new BehaviorSubject<StickyType>(null)
  label = ''
  constructor() { }

  ngOnInit() {
    this.stickyObservable$.subscribe(_ => this.resetLabel());
    this.stickyObservable$.next(this.column.sticky || null);
    this.stickyObservable$.pipe(
      skip(1),
      debounceTime(500),
    ).subscribe(stickyValue => {
      this.column.sticky = stickyValue;
      this.onRequestLayout.emit();
    })


  }

  resetLabel() {
    switch(this.stickyObservable$.getValue()) {
      case 'start': this.label = this.labelTranslation.stickyStart; break;
      case 'end': this.label = this.labelTranslation.stickyEnd; break;
      default: this.label = '';
    }
  }

  click() {
    if (!this.stickyObservable$.getValue()) {
      this.stickyObservable$.next('start')
    } else if (this.stickyObservable$.getValue() == 'start') {
      this.stickyObservable$.next('end')
    } else {
      this.stickyObservable$.next(null);
    }
  }

  stick(s: StickyType) {
    this.stickyObservable$.next(s);
  }

}