import { Type } from "@angular/core";
import { PropertyColumn } from "../column/column";

/**
 * Interface for header component. 
 */
export interface HeaderComponent {
  column: PropertyColumn<any>
  parameter?: any;
}

/**
 * 
 */
export interface HeaderRenderer {
  component: Type<HeaderComponent>,
  parameter?: any;
}
