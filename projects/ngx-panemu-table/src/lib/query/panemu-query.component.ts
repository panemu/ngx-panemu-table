import { CommonModule } from '@angular/common';
import { input, AfterViewInit, Component, OnDestroy, OnInit, ViewChild, effect, isSignal, Signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { debounce, distinctUntilChanged, Subscription } from 'rxjs';
import { ColumnType, MapColumn, PropertyColumn } from '../column/column';
import { PanemuTableController } from '../panemu-table-controller';
import { GroupbyComponent } from './groupby.component';
import { TableCriteria } from '../table-query';
import { PanemuTableService } from '../panemu-table.service';
import { LabelTranslation } from '../option/label-translation';
import { MatDialog } from '@angular/material/dialog';
import { FilterEditorComponent } from './editor/filter-editor.component';
import { Filter } from './filter';

@Component({
  selector: 'panemu-query',
  standalone: true,
  imports: [CommonModule, MatMenuModule, GroupbyComponent, MatAutocompleteModule, ReactiveFormsModule],
  templateUrl: './panemu-query.component.html',
})
export class PanemuQueryComponent implements OnInit, OnDestroy, AfterViewInit {
  controller = input.required<PanemuTableController<any>>();
  disabled = computed(() => this.controller().mode() != 'browse')
  groupByLabel = '';
  _columns!: PropertyColumn<any>[];
  _filterableColumns!: PropertyColumn<any>[];
  _searchableColumn!: PropertyColumn<any>[];
  txtCriteria = new FormControl('');
  _criteria: Filter[] = [];
  labelTranslation: LabelTranslation;
  searchTitle = '';
  hasGroupableColumn = true;
  @ViewChild('txtCriteriaElement', {read: MatAutocompleteTrigger}) txtCriteriaElement!: MatAutocompleteTrigger;


  constructor(public service: PanemuTableService, private dialog: MatDialog) {
    this.labelTranslation = service.getLabelTranslation();

    effect(() => this.onControllerChange())
    effect(() => {
      if (this.disabled()) {
        this.txtCriteria.disable()
      } else {
        this.txtCriteria.enable()
      }
    })
  }

  ngOnInit(): void {
    const searcForLabelTemplate = this.service.getLabelTranslation().searcForValueInColumn;
    this.txtCriteria.valueChanges.pipe(
      distinctUntilChanged(),
    ).subscribe({
      next: val => {
        if (val) {
          this.searchTitle = searcForLabelTemplate.replace('{par0}', val)
          this._searchableColumn = [...this._filterableColumns]
        } else {
          this._searchableColumn = [];
        }
      }
    })
  }

  forceQueryMenu() {
    this.searchTitle = this.labelTranslation.selectColumnToSearchOn;
    this._searchableColumn = [...this._filterableColumns]
  }

  ngAfterViewInit(): void {
    this.txtCriteriaElement.optionSelections.subscribe(val => {
      let criteriaValue = this.txtCriteria.value;
      if (criteriaValue) {
        const selectedColumn = this._columns.find(item => item.field == val.source.value);
        if (selectedColumn?.type == ColumnType.MAP && (selectedColumn as MapColumn<any>).valueMap) {
          const valueMap = (selectedColumn as MapColumn<any>).valueMap;
          const map: {[key: string] : any} = isSignal(valueMap) ? (valueMap as Signal<any>)() : valueMap;
          let mapValue = map[criteriaValue] ? criteriaValue : Object.keys(map).find(key => map[key].toLowerCase() == criteriaValue!.toLowerCase());
          if (!mapValue) {
            mapValue = Object.keys(map).find(key => (map[key] as string).toLowerCase().startsWith(criteriaValue!.toLowerCase()));
            if (!mapValue) {
              mapValue = Object.keys(map).find(key => (map[key] as string).toLowerCase().includes(criteriaValue!.toLowerCase()))
            }
          }
          criteriaValue = mapValue || criteriaValue;
        }

        this.controller().criteria.push({field: val.source.value, value: criteriaValue});
        this.reload();
      } else {
        this.editQuery({field: val.source.value, label: '', value: ''})
      }
      setTimeout(() => {
        this.txtCriteria.reset('');
        // this.txtCriteriaElement.op
      });
    })
  }


  private onControllerChange(): void {
    if (!this.controller()) return;
    this.hasGroupableColumn = !!this.controller().columnDefinition.body.find(item => !!item.groupable);
    this._columns = (this.controller().columnDefinition.body as PropertyColumn<any>[]).filter(item => !!item.field);
    this._filterableColumns = this._columns.filter(item => item.filterable);
    this.$subscription.add(
      this.controller().beforeReloadEvent.subscribe({
        next: _ => {
          this._criteria = this.controller().criteria.map(item => {
            let column = this._columns.find(clm => clm.field == item.field);
            return {field: column?.field.toString() || '', label: column!.label!, value: item.value}
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
    this.reload();
  }

  clearGroup() {
    this.controller().groupByColumns = [];
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

  editQuery(item: Filter) {
    FilterEditorComponent.show(this.dialog, this.controller().columnDefinition.body, {field: item.field, value: item.value}).then(result => {
      if (result) {
        const idx = this._criteria.indexOf(item);
        if (idx >=0) {
          this.controller().criteria[idx] = result;
        } else {
          this.controller().criteria.push(result);
        }
        this.reload();
      }
    })
  }
}
