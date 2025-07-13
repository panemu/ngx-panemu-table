import { isSignal, signal, Type } from "@angular/core";
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors } from "@angular/forms";
import { Observable, pairwise, Subscription, throwError } from "rxjs";
import { ColumnType, MapColumn, PropertyColumn } from "../column/column";
import { DateCellEditor } from "./date-cell-editor";
import { CellEditorComponent, CellEditorRenderer, CellValidationError, EditingInfo } from "./editing-info";
import { MapCellEditor, MapOption } from "./map-cell-editor";
import { NumberCellEditor } from "./number-cell-editor";
import { StringCellEditor } from "./string-cell-editor";
import { TABLE_MODE } from "./table-mode";
import { DateTimeCellEditor } from "./date-time-cell-editor";
import { PanemuTableService } from "../panemu-table.service";

interface EditingInfoMap<T> {
  rowData: T
  editingInfo: EditingInfo<T>
}

/**
 * This class enable [inline editing](/usages/inline-editing). It has 2 main methods:
 * 
 * - create reactive AbstractControl when editing is initated
 * - provide necessary methods to save or delete data
 * 
 * It provides default editor components for various `ColumnType`. One can provide ones own editor.
 * 
 */
export class PanemuTableEditingController<T> {

  private subscription$ = new Subscription();
  private mapEditingInfos: EditingInfoMap<T>[] = [];

  /**
   * @internal
   */
  pts!: PanemuTableService;

  /**
   * Clear FormControl subscription that trigger `onCommitEdit` call.
   * 
   * @internal
   * 
   */
  _reset() {
    this.subscription$.unsubscribe();
    this.subscription$ = new Subscription();
    this.mapEditingInfos = [];
  }

  private trackInvalidValue(field: keyof T, rowData: T, formControl: AbstractControl) {
    let existingEditingInfo = this.mapEditingInfos.find(item => item.rowData === rowData);
    if (existingEditingInfo?.editingInfo.originalRowData) {
      let renderer = Object.values(existingEditingInfo.editingInfo.editor).find(item => item.field == field);
      if (renderer && formControl.status == 'INVALID') {
        let errors: CellValidationError | string | undefined;

        if (formControl.errors) {
          errors = this.getErrorMessages(formControl.errors)
        } else if ((formControl instanceof FormGroup) || (formControl instanceof FormArray)) {
          errors = this.findErrorsRecursive(field.toString(), formControl)
        }
        if (errors) {
          renderer.errorMessage.set(errors);
        }
      } else {
        renderer?.errorMessage.set(null);
      }
    } else {
      console.error(`editing info not found for field ${field?.toString()}`)
    }
  }

  private findErrorsRecursive(parentField: string, form: FormGroup | FormArray) {
    let errors: CellValidationError = {};

    Object.keys(form.controls).forEach((field) => {
      const control = form.get(field);
      if (control?.errors) {
        errors[field] = this.getErrorMessages(control.errors);
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        const innerError = this.findErrorsRecursive(field, control);
        if (Object.keys(innerError).length) {
          errors[field] = innerError;
        }
      }
    });
    return errors;
  }

  /**
   * Helper method to update MapCellEditor options
   * @param field 
   * @param rowData 
   * @param options 
   */
  protected helper_updateMapCellOptions(field: keyof T, rowData: T, options?: MapOption[]) {
    let editingInfo = this._getEditingInfo(rowData);
    let editor = Object.values(editingInfo?.editor || {}).find(item => item.field == field);
    if (editor && isSignal(editor.parameter.options) ) {
      editor.parameter.options.set(options);
    }
  }

  /**
   * Helper method to update MapCellEditor loading status
   * @param field 
   * @param rowData 
   * @param loading 
   */
  protected helper_updateMapCellLoading(field: keyof T, rowData: T, loading: boolean) {
    let editingInfo = this._getEditingInfo(rowData);
    let editor = Object.values(editingInfo?.editor || {}).find(item => item.field == field);
    if (editor && isSignal(editor.parameter.loading) ) {
      editor.parameter.loading.set(loading);
    }
  }

  /**
   * Helper method to get formControl of specified field and rowData.
   * @param field 
   * @param rowData 
   * @returns 
   */
  protected helper_getFormControl(field: keyof T, rowData: T) {
    let editingInfo = this._getEditingInfo(rowData);
    return editingInfo?.form.controls[field.toString()];
  }
  
  private trackChange(field: keyof T, value: any, previousValue: any, rowData: T, formControl: AbstractControl) {
    rowData[field] = value;

    try {
      this.onCommitEdit(field, value, previousValue, rowData, formControl);
    } catch (e) {
      console.error('There was an error in onCommitEdit', e);
    }
    let existingEditingInfo = this.mapEditingInfos.find(item => item.rowData === rowData);
    if (existingEditingInfo?.editingInfo.originalRowData) {
      let renderers = Object.values(existingEditingInfo.editingInfo.editor).filter(item => item.field == field);
      renderers?.forEach(renderer => renderer.isChanged.set(existingEditingInfo?.editingInfo.originalRowData[field] != rowData[field]));
    }
  }

  /**
   * If user change a value in cell editor, this method is called. This is the place to put
   * logic to modify the states of other cell editor, or to set some values to other fields.
   * Please refer to 'helper_' methods of this class to get some handy functions.
   * @param field 
   * @param value 
   * @param previousValue 
   * @param rowData 
   * @param formControl 
   */
  protected onCommitEdit(field: keyof T, value: any, previousValue: any, rowData: T, formControl: AbstractControl) {}

  private createRenderer(component: Type<CellEditorComponent>, formControl: AbstractControl, field: keyof T) {
    let renderer: CellEditorRenderer<T> = {
      component, formControl, isChanged: signal(false), errorMessage: signal(null), field
    }
    return renderer;
  }

  /**
   * @internal
   */
  protected _createCellEditorRenderer(column: PropertyColumn<T>, formControl: AbstractControl): CellEditorRenderer<T> | null {
    let columnType = column.type!;
    let result: CellEditorRenderer<T> | null;
    if (columnType == ColumnType.INT || columnType == ColumnType.DECIMAL) {
      result = this.createRenderer(NumberCellEditor, formControl, column.field)
    } else if (columnType == ColumnType.DATE) {
      result = this.createRenderer(DateCellEditor, formControl, column.field)
    } else if (columnType == ColumnType.DATETIME) {
      result = this.createRenderer(DateTimeCellEditor, formControl, column.field)
    } else if (columnType == ColumnType.MAP) {
      let mapColumn = column as MapColumn<T>;
      let renderer = this.createRenderer(MapCellEditor, formControl, column.field);
      const valueMap = isSignal(mapColumn.valueMap) ? mapColumn.valueMap() : mapColumn.valueMap;
      if (valueMap && typeof valueMap == 'object') {
        const options = Object.keys(valueMap as Object).map(key => ({value: key.toString(), label: (valueMap as any)[key]}) )
        renderer.parameter = { options: signal(options), loading: signal(false) }
      }
      result = renderer;
    } else {
      result = this.createRenderer(StringCellEditor, formControl, column.field)
    }

    result = this.initCellEditorRenderer(result, column);

    return result;
  }

  /**
   * Several default `CellEditorComponent`s are provided based on `ColumnType`.
   * Override this method to change the default editor component, or return null
   * to disable editing on the passed column.
   * 
   * If you have a single field displayed in multiple columns and only want the
   * field to be editable in one of them, then override this method and return
   * null for column you don't want to be editable. Use `BaseColumn.__key` property to identify
   * the column.
   * 
   * This method works in conjunction with `createFormControl`. This method is only
   * called when the `column.field` has formControl value returned by createFormControl.
   * 
   * @param renderer 
   * @returns 
   */
  protected initCellEditorRenderer(renderer: CellEditorRenderer<T>, column: PropertyColumn<T>): CellEditorRenderer<T> | null {
    return renderer;
  }

  /**
   * 
   * @internal
   * @param rowData 
   * @returns 
   */
  _getEditingInfo(rowData: T) {
    return this.mapEditingInfos.find(item => item.rowData === rowData)?.editingInfo;
  }

  /**
   * @internal
   * @param rowData 
   */
  _deleteEditingInfo(rowData: T) {
    this.mapEditingInfos = this.mapEditingInfos.filter(item => item.rowData != rowData);
  }

  /**
   * 
   * @internal
   */
  _createEditingInfo(columns: PropertyColumn<T>[], rowData: T, tableMode: TABLE_MODE) {

    let existingEditingInfo = this.mapEditingInfos.find(item => item.rowData === rowData);
    if (existingEditingInfo) {
      return existingEditingInfo.editingInfo;
    }

    let uniqueFields = [...new Set(columns.map(item => item.field))];
    let formControls: { [k in keyof T]: AbstractControl } = {} as any;

    for (const field of uniqueFields) {
      const formControl = this.createFormControl(field, rowData, tableMode);
      if (formControl) {
        /**
         * When debugging in chrome, the above `field` constant variable causing
         * debugger crash as it is used in trackChange and trackInvalidValue method.
         * 
         * That probably due to field constant is used in too-deeply-nested code.
         */
        let thisVariablePreventChromeDebuggerCrash = field;

        this.subscription$.add(
          formControl.valueChanges
            .pipe(pairwise())
            .subscribe(([prev, next]: [any, any]) => {
              this.trackChange(thisVariablePreventChromeDebuggerCrash, next, prev, rowData, formControl)
            })
        )

        this.subscription$.add(
          formControl.statusChanges.subscribe(status => {
            this.trackInvalidValue(thisVariablePreventChromeDebuggerCrash, rowData, formControl);
          })
        )

        formControls[field] = formControl

        if (!(rowData as Object).hasOwnProperty(field)) {
          (rowData as any)[field] = undefined;
        }
      }
    }

    let formGroup = new FormGroup(formControls);

    let editor: { [k: string]: CellEditorRenderer<T> } = {};

    /**
     * Exclude columns that doesn't have formControl
     */
    columns = columns.filter(item => !!formControls[item.field]);
    let label: {[k in keyof T]: string} = {} as any;

    /**
     * A field can be displayed by multiple columns. We can edit the same field
     * in all of the columns or some of them.
     * 
     * Here we only display editor to to cell that the corresponding
     * column.__key has editor.
     */
    for (const clm of columns) {
      let celleditorRenderer = this._createCellEditorRenderer(clm, formControls[clm.field]);
      if (celleditorRenderer) {
        label[clm.field] = clm.label ?? clm.field.toString();
        editor[clm.__key!] = celleditorRenderer;
      }
    }

    let editingInfo: EditingInfo<T> = { form: formGroup, editor, originalRowData: this.cloneRowData(rowData), label };

    this.mapEditingInfos.push({ rowData, editingInfo })

    /**
     * Patch value should be done after editingInfo pushed to the map.
     */
    formGroup.patchValue(rowData as any);

    return editingInfo;
  }

  /**
   * Clone rowData in order to be able to compare changed property values later.
   * @param rowData 
   * @returns 
   */
  protected cloneRowData(rowData: T) {
    try {
      return JSON.parse(JSON.stringify(rowData)) as Readonly<T>
    } catch (e) {
      console.error(e);
      return {} as T;
    }
  }

  /**
   * This method uses validators defined in form control returned by `createFormControl`.
   * On invalid field, it will call `showValidationError`.
   * 
   * @param rowData 
   * @returns 
   * @internal
   */
  _validate(rowData: T) {
    let map = this.mapEditingInfos.find(item => item.rowData == rowData);
    if (!map) {
      return false;
    }
    if (map.editingInfo.form.invalid) {
      map.editingInfo.form.markAllAsTouched();
      this.handleInvalidFormGroup(map.editingInfo.form, map.editingInfo.label);
      return false;
    }

    return true;
  }

  private handleInvalidFormGroup(form: FormGroup, label: {[field in keyof T]: string}) {
    let errors = this.findErrorsRecursive('form', form);
    this.showValidationError(errors, label);
  }

  /**
   * Display validation error. By default it forward to `PanemuTableService.handleError` method.
   * @param error 
   * @param label 
   */
  showValidationError(error: CellValidationError | string, label: {[field in keyof T]: string}) {
    if (typeof error == 'string') {
      this.pts.handleError(new Error(error))
    } else {
      this.pts.handleError(new Error(JSON.stringify(error)))
    }
  }

  /**
   * Method to compare if 2 passed objects contains the same value. This method is called
   * before saving data in edit mode. Only changed rowData is included in the save.
   * In insert mode, all newly-inserted rows are considered changed
   * thus all of them are included in the save.
   * @param originalRowData 
   * @param rowData 
   * @returns 
   */
  protected isChanged(originalRowData: T, rowData: T) {

    let uniqueFields = Object.keys(originalRowData as Object).concat(Object.keys(rowData as Object))
    uniqueFields = [...new Set(uniqueFields)];

    for (const key of uniqueFields) {
      if ((originalRowData as any)[key] != (rowData as any)[key]) {
        return true;
      }
    }
    return false;
  }

  /**
   * This method is called upon insert action. Override this method to provide default
   * values for the new rowData.
   * @returns by default return empty object `{}`
   */
  createNewRowData(): Partial<T> {
    return {};
  }

  /**
   * If in insert mode, all new rowData are considered changed.
   * If in edit mode, this method will compare the rowData with the original
   * that was created by `cloneRowData` method.
   * 
   * @param mode 
   * @returns 
   * @internal
   */
  _getChangedData(mode: TABLE_MODE) {
    if (mode == "insert") {
      return this.mapEditingInfos.map(item => item.rowData);
    }
    let result: T[] = [];
    for (const ei of this.mapEditingInfos) {
      if (this.isChanged(ei.editingInfo.originalRowData, ei.rowData)) {
        result.push(ei.rowData);
      }
    }
    return result;
  }

  /**
   * @internal
   * @param rowData 
   */
  _startEdit(rowData: T) {
    let editingInfo = this._getEditingInfo(rowData);
    if (editingInfo){
      this.onStartEdit(rowData, editingInfo)
    }
  }

  /**
   * Called upon selected row when table mode is edit or insert
   * @param rowData 
   * @param editingInfo 
   */
  protected onStartEdit(rowData: T, editingInfo: EditingInfo<T>) {}

  /**
   * This method create AbstractControl without validator specified. Override this method to:
   * 
   * 1. Create `AbstractControl` with validators, `updatedOn` or other attribute specified.
   * 2. Make a cell not editable by returning null.
   * 
   * If a field is displayed in multiple columns, use `initCellEditorRenderer` method to specify
   * in what column the field is editable (optional).
   * 
   * This method should always return new instance of FormControl, FormGroup, FormArray or null.
   * Do not reusea FormControl instance for mutiple fields/rows.
   * 
   * @param field 
   * @param rowData 
   * @param tableMode 
   * @returns AbstractControl if the cell is editable.
   */
  createFormControl(field: keyof T, rowData: T, tableMode: TABLE_MODE): AbstractControl | null | undefined {
    return new FormControl('')
  }

  /**
   * Save logic. This method must be overriden to enable save functionality. The returned data
   * will be assigned to respective table row. So if there is data change in server such as
   * generated `id` or `updated_on` properties, it will also be displayed in the table automatically.
   * 
   * If server api doesn't return the data, override `afterSuccessfulSave` where you can put logic
   * to reload the table.
   * 
   * The PanemuTableEditingController.afterSuccessfulSave` is called upon successful save. You can
   * override it to display information dialog if required.
   * 
   * @param data 
   * @param tableMode 
   * @returns 
   */
  saveData(data: T[], tableMode: TABLE_MODE): Observable<T[]> {
    return throwError(() => new Error('Not implemented. Override PanemuTableEditingController.saveData method to implement it.'))
  }

  /**
   * This method called after successful save. It is designed to display information dialog
   * or to put logic to trigger table reload.
   * 
   * @param data Changed data that have been saved.
   * @param tableMode `insert` or `edit`
   */
  afterSuccessfulSave(data: T[], tableMode: TABLE_MODE) { }

  /**
   * This method is called before calling saveData. Override this method to do some
   * row level validations or preprocessing.
   * @param data 
   * @param tableMode `insert` or `edit`
   * @returns by default return true promise. Return false promise to cancel save.
   */
  canSave(data: T[], tableMode: TABLE_MODE) {
    return Promise.resolve(true)
  }

  /**
   * This method called before deleting a row. Override this method to display a confirmation dialog
   * that allow user to cancel.
   * 
   * @param rowToDelete Row to be deleted
   * @param tableMode Either 'browse' to delete persisted data or 'insert' to delete unsaved new row.
   * @returns promise that if it resolves true then continue delete, false to cancel.
   */
  canDelete(rowToDelete: T, tableMode: TABLE_MODE): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * If table is in edit/insert mode and there are changed rows, this method is called.
   * This is where you can put logic to show confirmation dialog if user want to reload the table
   * causing unsaved data lost.
   * 
   * @param changedRows 
   * @param tableMode 
   * @returns by default "Promise.true". Return "Promise.false" to cancel reload.
   */
  canReload(changedRows: T[], tableMode: TABLE_MODE): Promise<boolean> {
    return Promise.resolve(true);
  }
  /**
   * Delete logic. This method must be overriden to enable delete functionality.
   * @param data 
   * @returns 
   */
  deleteData(data: T): Observable<any> {
    return throwError(() => new Error('Not Implemented. Override PanemuTableEditingController.deleteData method to implement it.'))
  }

  /**
   * This method is called after successful deletion of persisted data. It isn't called when deleting new row in `insert` mode.
   * Override this method to display information dialog if required.
   * 
   * @param data the data returned by `deleteData` observable. The type is unknown.
   */
  afterSuccessfulDelete(serverData: unknown) { }

  /**
   * Get error message. It support localisation as it uses `PanemuTableService.getLabelTranslation`.
   * 
   * Override this method to add or create a custom validation message.
   * @param errors 
   * @returns 
   */
  protected getErrorMessages(errors: ValidationErrors) {

    const validationErrors: { [key: string]: string } = this.pts.getLabelTranslation().validationError;

    let errorCode = Object.keys(errors)[0]
    let msg = validationErrors[errorCode];
    let errorValue = errors[errorCode];

    if (msg) {
      if (['minlength', 'maxlength'].includes(errorCode)) {
        msg = msg.replace('{par0}', errorValue.requiredLength).replace('{par1}', errorValue.actualLength);
      } else if (errorCode == 'min') {
        msg = msg.replace('{par0}', errorValue.min).replace('{par1}', errorValue.actual);
      } else if (errorCode == 'max') {
        msg = msg.replace('{par0}', errorValue.max).replace('{par1}', errorValue.actual);
      }
      return msg;
    } else {
      return typeof errorValue == 'string' ? errorValue : `ERROR  ${errorCode}: ` + JSON.stringify(errorValue);
    }

  }
}