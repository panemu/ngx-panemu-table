
import { AfterViewInit, Component, computed, effect, inject, input, isSignal, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { PropertyColumn } from '../column/column';
import { LabelTranslation } from '../option/label-translation';
import { PanemuTableController } from '../panemu-table-controller';
import { PanemuTableService } from '../panemu-table.service';
import { PanemuGroupbyComponent } from './panemu-groupby.component';
import { QueryBuilder } from './query-builder/query-builder';
import { Overlay } from '@angular/cdk/overlay';
import { Dialog } from '@angular/cdk/dialog';
import { SearchableColumn } from './query-builder/types';

@Component({
    selector: 'panemu-query',
    imports: [MatMenuModule, PanemuGroupbyComponent, MatAutocompleteModule, ReactiveFormsModule],
    templateUrl: './panemu-query.component.html'
})
export class PanemuQueryComponent implements OnInit, OnDestroy, AfterViewInit {
  controller = input.required<PanemuTableController<any>>();
  disabled = computed(() => this.controller().mode() != 'browse')
  groupByLabel = '';
  _filterableColumns = signal<PropertyColumn<any>[]>([]);
  
  labelTranslation: LabelTranslation;
  hasGroupableColumn = signal(false);
  overlay = inject(Overlay);

  constructor(public service: PanemuTableService, private dialog: Dialog) {
    this.labelTranslation = service.getLabelTranslation();

    effect(() => this.onControllerChange())
    
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    
  }


  private onControllerChange(): void {
    if (!this.controller()) return;
    this.hasGroupableColumn.set(!!this.controller().columnDefinition.body.find(item => !!item.groupable));
    let _columns = (this.controller().columnDefinition.body).filter(item => !!item.field);
    this._filterableColumns.set(_columns.filter(item => item.filterable));
    this.$subscription.add(
      this.controller().beforeReloadEvent.subscribe({
        next: _ => {
          
          this.groupByLabel = '';
          this.controller().groupByColumns.forEach(g => {
            let clm = _columns.find(item => item.field == g.field);
            this.groupByLabel = this.groupByLabel + clm?.label;
            if (g.modifier) {
              this.groupByLabel = this.groupByLabel + ': ' + g.modifier;
            }
            this.groupByLabel = this.groupByLabel + ' | '
          });
          this.groupByLabel = this.groupByLabel.trim();
          if (this.groupByLabel.endsWith('|')) {
            this.groupByLabel = this.groupByLabel.substring(0, this.groupByLabel.length - 1).trim();
          }
        }
      })
    );
  }

  clearGroup() {
    this.controller().groupByColumns = [];
    this.reload();
  }

  clearCriteria() {
    this.controller().criteria = null;
    this.reload();
  }

  private reload() {
    this.controller().reloadData();
    this.controller().saveState();
  }

  private $subscription = new Subscription();
  ngOnDestroy(): void {
    this.$subscription.unsubscribe();
  }

  showQueryBuilder() {
    let fieldDefs = this.controller().columnDefinition.body.filter(c => c.filterable) as SearchableColumn[];

    QueryBuilder.show(this.dialog, this.overlay, fieldDefs, this.controller().criteria).then(result => {
      if (result?.apply) {
        this.controller().criteria = result.predicate;
        this.reload();
      }
    });
  }
}
