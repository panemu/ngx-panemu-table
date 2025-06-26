import { Component, computed, input, Input, OnInit } from '@angular/core';
import { PanemuTableController } from '../panemu-table-controller';
import { CommonModule } from '@angular/common';
import { PropertyColumn, ColumnType } from '../column/column';
import {MatMenuModule} from '@angular/material/menu';
import { PanemuTableService } from '../panemu-table.service';
import { LabelTranslation } from '../option/label-translation';

@Component({
  selector: 'panemu-groupby',
  templateUrl: 'panemu-groupby.component.html',
  standalone: true,
  imports: [CommonModule, MatMenuModule],
})

export class PanemuGroupbyComponent {
  labelTranslation: LabelTranslation;
  controller = input.required<PanemuTableController<any>>();
  _columns = computed(() => {
    if (this.controller()) {
      return this.controller().columnDefinition.body.filter(item => !!item.groupable)
    }
    return []
  });
  _columnType = ColumnType;
  constructor(public service: PanemuTableService) { 
    this.labelTranslation = service.getLabelTranslation();
  }

  toggleGroup(item: PropertyColumn<any>, modifier?: string) {
    let found = null;

    for (let index = 0; index < this.controller().groupByColumns.length; index++) {
      const group = this.controller().groupByColumns[index];
      if (item.field == group.field) {
        found = index;
        if (!modifier || modifier == group.modifier) {
          break;
        }
      }
    }
    
    if (found != null && found >= 0) {
      if (modifier) {
        let comparison = this.compareModifier(modifier, this.controller().groupByColumns[found].modifier || '');
        if (comparison == 0) {
          this.controller().groupByColumns.splice(found, 1);
        } else if (comparison == 1) {
          this.controller().groupByColumns.splice(found + 1, 0, { field: item.field.toString(), modifier});
        } else {
          this.controller().groupByColumns.splice(found, 0, { field: item.field.toString(), modifier});
        }
      } else {
        this.controller().groupByColumns.splice(found, 1);
      }
    } else {
      this.controller().groupByColumns.push({ field: item.field.toString(), modifier});
    }
    this.controller().reloadData();
    this.controller().saveState();
  }

  isInGroup(clm: PropertyColumn<any>, modifier?: string): boolean {
    const inGroup = this.controller().groupByColumns.find(item => item.field == clm.field && (!modifier || modifier == item.modifier));
    return !!inGroup;
  }

  private compareModifier(first: string, second: string) {
    let mods = ['year', 'month', 'day'];
    let idx1 = mods.indexOf(first);
    let idx2 = mods.indexOf(second);
    return idx1 > idx2 ? 1 : idx1 < idx2 ? -1 : 0;
  }

}