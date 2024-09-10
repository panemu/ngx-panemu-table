import { isSignal, Signal, TemplateRef, Type, WritableSignal } from "@angular/core";
import { PropertyColumn } from "../column/column";

export class ExpansionRow<T> {

  constructor(public row: T,
    public component: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<T>>,
    public column: PropertyColumn<T>,
    public closeCallback: (row: T) => void,
    public expanded?: WritableSignal<boolean>
  ) { 
  }

  isTemplateRef() {
    return isSignal(this.component)
  }

  close() {
    this.closeCallback(this.row)
  }

}

export interface ExpansionRowRenderer<T> {
  row: T;
  column: PropertyColumn<T>
  close: Function
}