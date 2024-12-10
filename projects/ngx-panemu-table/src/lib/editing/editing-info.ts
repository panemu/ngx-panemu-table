import { Type, WritableSignal } from "@angular/core"
import { AbstractControl, FormGroup } from "@angular/forms"

/**
 * Type for mapping a field with validation error. For `FormControl`, the value is a string,
 * for `FormGroup` the value can be string or CellValidationError because a `FormGroup`
 * contains multiple `FormControl`s.
 */
export type CellValidationError = {[field: string] : string | Object}

/**
 * Interface for cell editor component
 */
export interface CellEditorComponent {
  /**
   * `FormControl`, `FormGroup` or `FormArray` bound to editor component
   */
	formControl: AbstractControl

  /**
   * Custom parameter for custom logic. For example, `MapCellEditor` has options and loading property
   * as part of this parameter.
   */
	parameter?: any

  /**
   * Error message to be displayed in the editor.
   */
  errorMessage: WritableSignal<string | CellValidationError | null>
}

/**
 * The instance of this interface hold editing-related information for a table cell.
 */
export interface CellEditorRenderer<T> {
  /**
   * The editor component
   */
  component: Type<CellEditorComponent>

  /**
   * `FormControl`, `FormGroup` or `FormArray` to be passed to editor component.
   */
  formControl: AbstractControl

  /**
   * Custom parameter to be passed to the editor
   */
  parameter?: any

  /**
   * Boolean signal. It true when the cell hold different value with original data.
   */
  isChanged: WritableSignal<boolean>

  /**
   * This object stores the validation error message defined in `formControl`.
   */
  errorMessage: WritableSignal<string | CellValidationError | null>

  /**
   * BaseColumn.field
   */
  field: keyof T
}

/**
 * The instance of this interface hold editing-related information for a table row.
 */
export interface EditingInfo<T> {
  /**
   * Angular `FormGroup` that power the editing.
   */
  form: FormGroup

  /**
   * Object that stores the editors. The key is the `BaseColumn.__key` the value is the editor.
   */
  editor: { [k: string]: CellEditorRenderer<T> }

  /**
   * Object that stores the column labels. The key is the BaseColumn.field the value is the label.
   * This object is derived from `ColumnDefinition.body`.
   */
  label: {[k in keyof T]: string}

  /**
   * Original row data used to detect what cells are changed.
   */
  originalRowData: T
}