import { Type } from "@angular/core";
import { LeafColumn } from "../column/column";

/**
 * Interface for header component. 
 */
export interface HeaderComponent {
  column: LeafColumn<any>
  parameter?: any;
}

/**
 * 
 */
export interface HeaderRenderer {
  component: Type<HeaderComponent>,
  parameter?: any;
}
