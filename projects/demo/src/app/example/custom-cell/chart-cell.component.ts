import { Component, effect, OnInit, Signal, viewChild } from '@angular/core';
import { ChartistComponent, ChartistModule, Configuration } from 'ng-chartist';
import { CellComponent, CellRenderer, PropertyColumn } from 'ngx-panemu-table';

@Component({
  template: `
	<x-chartist [configuration]="configuration"></x-chartist>
	`,
  standalone: true,
  imports: [ChartistModule]
})

export class ChartCellComponent implements CellComponent<any> {

  configuration: Configuration = {
    // Specify the type of chart and the rest of the config will be typed
    type: "Line",
    // Required
    data: {
      labels: [],
      // Our series array that contains series objects or in this case series data arrays
      series: [
        []
      ],
    },
    options: {
      axisX: {
        showGrid: false,
        showLabel: true,
      },
      axisY: {
        showGrid: false,
        showLabel: false,
      },
      high: 10,
      low: 0,
      height: 48,
      chartPadding: { top: 0, right: -15, left: -30, bottom: -15 },

    }
  }
  row: any;
  column!: PropertyColumn<any>;
  parameter?: { signalProperty: string };
  chart = viewChild(ChartistComponent);

  constructor() {
    effect(() => {

      this.configuration.data.series[0] = this.row[this.parameter?.signalProperty || '']?.();
      this.configuration.data.labels = this.row[this.parameter?.signalProperty || '']?.();

      this.chart()?.chart.update(this.configuration.data);
    })
  }
  
  static create(signalProperty: string): CellRenderer {
    return {
      component: ChartCellComponent,
      parameter: {signalProperty}
    }
  }
}