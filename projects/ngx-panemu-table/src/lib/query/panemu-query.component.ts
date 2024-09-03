import { CommonModule } from '@angular/common';
import { input, AfterViewInit, Component, OnDestroy, OnInit, ViewChild, effect, isSignal, Signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { ColumnType, MapColumn, PropertyColumn } from '../column/column';
import { PanemuTableController } from '../panemu-table-controller';
import { GroupbyComponent } from './groupby.component';
import { TableCriteria } from '../table-query';
import { PanemuTableService } from '../panemu-table.service';
import { LabelTranslation } from '../option/label-translation';

@Component({
  selector: 'panemu-query',
  standalone: true,
  imports: [CommonModule, MatMenuModule, GroupbyComponent, MatAutocompleteModule, ReactiveFormsModule],
  templateUrl: './panemu-query.component.html',
})
export class PanemuQueryComponent implements OnDestroy, AfterViewInit {
  controller = input.required<PanemuTableController<any>>();
  groupByLabel = '';
  _columns!: PropertyColumn<any>[];
  _filterableColumns!: PropertyColumn<any>[];
  txtCriteria = new FormControl('');
  _criteria: TableCriteria[] = [];
  labelTranslation: LabelTranslation;
  @ViewChild('txtCriteriaElement', {read: MatAutocompleteTrigger}) txtCriteriaElement!: MatAutocompleteTrigger;


  constructor(public service: PanemuTableService) {
    this.labelTranslation = service.getLabelTranslation();

    effect(() => this.onControllerChange())
  }
  ngAfterViewInit(): void {
    this.txtCriteriaElement.optionSelections.subscribe(val => {
      let criteriaValue = this.txtCriteria.value;
      if (criteriaValue) {
        const selectedColumn = this._columns.find(item => item.field == val.source.value);
        if (selectedColumn?.type == ColumnType.MAP && (selectedColumn as MapColumn<any>).valueMap) {
          const valueMap = (selectedColumn as MapColumn<any>).valueMap;
          const map: {[key: string] : any} = isSignal(valueMap) ? (valueMap as Signal<any>)() : valueMap;
          criteriaValue = Object.keys(map).find(key => map[key].toLowerCase() == criteriaValue!.toLowerCase()) || criteriaValue;
        }

        this.controller().criteria.push({field: val.source.value, value: criteriaValue});
        this.controller().reloadData();
      }
      setTimeout(() => {
        this.txtCriteria.reset();
      });
    })
  }


  private onControllerChange(): void {
    if (!this.controller()) return;
    this._columns = (this.controller().columns as PropertyColumn<any>[]).filter(item => !!item.field);
    this._filterableColumns = this._columns.filter(item => item.filterable);
    this.$subscription.add(
      this.controller().__onReload().subscribe({
        next: _ => {
          this._criteria = this.controller().criteria.map(item => {
            let column = this._columns.find(clm => clm.field == item.field);
            return {field: column?.label || '', value: item.value}
          })
          this.groupByLabel = '';
          this.controller().groupByColumns.forEach(g => {
            let clm = this._columns.find(item => item.field == g.field);
            this.groupByLabel = this.groupByLabel + clm?.label;
            if (g.modifier) {
              this.groupByLabel = this.groupByLabel + ':' + g.modifier;
            }
            this.groupByLabel = this.groupByLabel + ' > '
          });
          this.groupByLabel = this.groupByLabel.trim();
          if (this.groupByLabel.endsWith('>')) {
            this.groupByLabel = this.groupByLabel.substring(0, this.groupByLabel.length - 1).trim();
          }
        }
      })
    );
  }

  deleteCriteria(index: number) {
    this.controller().criteria.splice(index, 1);
    this.controller().reloadData();
  }

  clearGroup() {
    this.controller().groupByColumns = [];
    this.controller().reloadData();
  }

  private $subscription = new Subscription();
  ngOnDestroy(): void {
    this.$subscription.unsubscribe();
  }
  
}
