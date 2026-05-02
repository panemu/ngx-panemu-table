import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QueryCondition } from './query-condition';
import { ConditionNode, GroupNode, LogicalKind, Node, SearchableColumn, newCondition, newGroup } from './types';
import { QueryDragService } from './query-drag.service';

@Component({
  selector: 'app-query-group',
  standalone: true,
  imports: [FormsModule, QueryCondition],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './query-group.html'
})
export class QueryGroup {
  readonly node = input.required<GroupNode>();
  readonly fields = input.required<SearchableColumn[]>();
  readonly canRemove = input<boolean>(false);
  readonly remove = output<void>();
  readonly changed = output<void>();


  protected readonly drag = inject(QueryDragService);
  protected readonly hoverIndex = signal<number | null>(null);

  protected readonly isDragging = computed(() => this.drag.dragging() !== null);
  protected readonly canAccept = computed(() => this.drag.canDropInto(this.node()));

  asGroup(child: Node): GroupNode | null { return child.kind === 'group' ? child : null; }
  asCondition(child: Node): ConditionNode | null { return child.kind === 'condition' ? child : null; }

  setLogical(logical: LogicalKind) {
    this.node().logical = logical;
    this.changed.emit();
  }

  addCondition() {
    const f = this.fields()[0];
    if (!f) return;
    this.node().children.push(newCondition(f));
    this.changed.emit();
  }

  addGroup() {
    this.node().children.push(newGroup('and'));
    this.changed.emit();
  }

  removeChild(index: number) {
    this.node().children.splice(index, 1);
    this.changed.emit();
  }

  bubble() {
    this.changed.emit();
  }

  onDragStart(event: DragEvent, index: number) {
    const child = this.node().children[index];
    if (!child) return;
    this.drag.start(child, this.node());
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // use the row as the drag image instead of just the handle button
      const handle = event.target as HTMLElement;
      const row = handle.closest('.row') as HTMLElement | null;
      if (row) event.dataTransfer.setDragImage(row, 12, 12);
    }
  }

  onDragEnd() {
    this.drag.end();
    this.hoverIndex.set(null);
  }

  onDragOver(event: DragEvent, index: number) {
    if (!this.canAccept()) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.hoverIndex.set(index);
  }

  onDragLeave(index: number) {
    if (this.hoverIndex() === index) this.hoverIndex.set(null);
  }

  onDrop(event: DragEvent, index: number) {
    if (!this.canAccept()) return;
    event.preventDefault();
    event.stopPropagation();
    this.hoverIndex.set(null);
    const moved = this.drag.drop(this.node(), index);
    if (moved) this.changed.emit();
  }
}
