import { ChangeDetectionStrategy, Component, computed, input, output, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConditionNode, newCondition, Op, OP_LABELS, OPS_BY_TYPE, SearchableColumn } from './types';

@Component({
  selector: 'app-query-condition',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './query-condition.html'
})
export class QueryCondition {
  readonly node = input.required<ConditionNode>();
  readonly fields = input.required<SearchableColumn[]>();
  readonly remove = output<void>();
  readonly changed = output<void>();

  // Bumped on every local mutation of the node object. computed() values that
  // read mutated properties depend on this so they invalidate — the node
  // signal reference itself never changes (parent owns it, we mutate in place).
  private readonly tick = signal(0);

  readonly fieldDef = computed(() => {
    this.tick();
    const name = this.node().field;
    return this.fields().find(f => f.field === name);
  });

  readonly enumKeys = computed(() => {
    const fd = this.fieldDef();
    
    return fd?.type === 'map' ? Object.keys((fd.valueMap as Signal<any>)() ?? {}) : [];
  });

  readonly enumMap = computed(() => {
    const fd = this.fieldDef();
    return fd?.type === 'map' ? (fd.valueMap as Signal<any>)() ?? {} : {};
  });

  readonly availableOps = computed<Op[]>(() => {
    const fd = this.fieldDef();
    return fd ? OPS_BY_TYPE[fd.type!] : [];
  });

  readonly opLabels = OP_LABELS;

  readonly inputType = computed<string>(() => {
    const fd = this.fieldDef();
    if (!fd) return 'text';
    switch (fd.type) {
      case 'int': return 'number';
      case 'decimal': return 'number';
      case 'date': return 'date';
      case 'datetime': return 'datetime-local';
      default: return 'text';
    }
  });

  readonly needsValue = computed(() => {
    this.tick();
    const op = this.node().op;
    return op !== 'isNull' && op !== 'isNotNull' && op !== 'in' && op !== 'notIn';
  });

  readonly needsList = computed(() => {
    this.tick();
    const op = this.node().op;
    return op === 'in' || op === 'notIn';
  });

  readonly canCaseInsensitive = computed(() => {
    const fd = this.fieldDef();
    if (!fd || fd.type !== 'string') return false;
    const op = this.node().op;
    return op === 'eq' || op === 'neq' || op === 'contains' || op === 'startsWith' || op === 'endsWith';
  });

  onFieldChange(newName: string) {
    const fd = this.fields().find(f => f.field === newName);
    if (!fd) return;
    const fresh = newCondition(fd);
    const n = this.node();
    n.field = fresh.field;
    n.op = fresh.op;
    n.value = '';
    n.values = '';
    n.caseInsensitive = fresh.caseInsensitive;
    this.tick.update(v => v + 1);
    this.changed.emit();
  }

  onOpChange(newOp: Op) {
    this.node().op = newOp;
    this.tick.update(v => v + 1);
    this.changed.emit();
  }

  onValueChange() {
    this.tick.update(v => v + 1);
    this.changed.emit();
  }
}
