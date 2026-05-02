import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, Query, signal } from '@angular/core';
import { QueryGroup } from './query-group';
import { QueryDragService } from './query-drag.service';
import { GroupNode, Predicate, SearchableColumn, fromPredicate, newGroup, toPredicate } from './types';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { firstValueFrom } from 'rxjs';
import { PanemuTableService } from '../../panemu-table.service';

interface QueryBuilderResult {
  apply: boolean
  predicate: Predicate | null;
}

@Component({
  selector: 'app-query-builder',
  standalone: true,
  imports: [QueryGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './query-builder.html'
})
export class QueryBuilder {
  readonly fields = input.required<SearchableColumn[]>();
  readonly predicateChange = output<Predicate | null>();
  readonly root = signal<GroupNode>(newGroup('and'));
  private readonly version = signal(0);
  private readonly drag = inject(QueryDragService);
  pts = inject(PanemuTableService)
  labelTranslation = this.pts.getLabelTranslation()

  dialogRef = inject<DialogRef<QueryBuilderResult>>(DialogRef<QueryBuilderResult>);

  readonly fieldMap = computed(() => new Map(this.fields().map(f => [String(f.field), f])));

  readonly predicate = computed(() => {
    this.version();
    this.drag.tick();
    return toPredicate(this.root(), this.fieldMap());
  });

  constructor() {
    let lastTick = this.drag.tick();
    effect(() => {
      const t = this.drag.tick();
      if (t !== lastTick) {
        lastTick = t;
        this.predicateChange.emit(this.predicate());
      }
    });
  }

  onChanged() {
    this.version.update(v => v + 1);
    this.predicateChange.emit(this.predicate());
  }

  reset() {
    this.root.set(newGroup('and'));
    this.onChanged();
  }

  load(p: Predicate) {
    this.root.set(fromPredicate(p));
    this.onChanged();
  }

  static show(dialog: Dialog, overlay: Overlay, fields: SearchableColumn[], predicate?: Predicate | null): Promise<QueryBuilderResult | undefined> {
    let ref: DialogRef<QueryBuilderResult, QueryBuilder> = dialog.open(QueryBuilder, {
      positionStrategy: overlay.position().global().right(),
      minWidth: 300,
      panelClass: 'panemu-setting',
    })
    ref.componentRef?.setInput('fields', fields);
    if (predicate) {
      ref.componentInstance!.load(predicate);
    }
    return firstValueFrom(ref.closed);
  }

  onApply() {
    this.dialogRef.close({ apply: true, predicate: this.predicate() });
  }

  onReset() {
    this.reset();
  }

  onCancel() {
    this.dialogRef.close({ apply: false, predicate: null });
  }
}
