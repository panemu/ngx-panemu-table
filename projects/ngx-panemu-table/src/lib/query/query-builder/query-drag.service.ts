import { Injectable, signal } from '@angular/core';
import { GroupNode, Node } from './types';

interface DragState {
  node: Node;
  sourceParent: GroupNode;
}

@Injectable({ providedIn: 'root' })
export class QueryDragService {
  private readonly state = signal<DragState | null>(null);
  private readonly _tick = signal(0);

  readonly dragging = this.state.asReadonly();
  readonly tick = this._tick.asReadonly();

  start(node: Node, sourceParent: GroupNode) {
    this.state.set({ node, sourceParent });
  }

  end() {
    this.state.set(null);
  }

  canDropInto(target: GroupNode): boolean {
    const s = this.state();
    if (!s) return false;
    if (s.node.kind !== 'group') return true;
    return !this.containsGroup(s.node, target);
  }

  drop(targetParent: GroupNode, targetIndex: number): boolean {
    const s = this.state();
    this.state.set(null);
    if (!s) return false;
    if (s.node.kind === 'group' && this.containsGroup(s.node, targetParent)) return false;

    const removeIdx = s.sourceParent.children.indexOf(s.node);
    if (removeIdx === -1) return false;

    s.sourceParent.children.splice(removeIdx, 1);

    let insertIdx = targetIndex;
    if (s.sourceParent === targetParent && removeIdx < targetIndex) insertIdx = targetIndex - 1;

    targetParent.children.splice(insertIdx, 0, s.node);
    this._tick.update(v => v + 1);
    return true;
  }

  private containsGroup(root: GroupNode, target: GroupNode): boolean {
    if (root === target) return true;
    for (const c of root.children) {
      if (c.kind === 'group' && this.containsGroup(c, target)) return true;
    }
    return false;
  }
}
