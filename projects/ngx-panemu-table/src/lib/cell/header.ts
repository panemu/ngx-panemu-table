import { Type } from "@angular/core";
import { PropertyColumn } from "../column/column";

export interface HeaderRenderer {
  component: Type<HeaderComponent<any>>,
  parameter?: any;
}

export interface HeaderComponent<T> {
  column: PropertyColumn<T>
  parameter?: any;
}
