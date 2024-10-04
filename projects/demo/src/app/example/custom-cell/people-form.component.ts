import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PanemuBusyIndicatorComponent, PropertyColumn, ExpansionRowRenderer } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-people-form',
  templateUrl: 'people-form.component.html',
  standalone: true,
  imports: [PanemuBusyIndicatorComponent, ReactiveFormsModule],

  //OnPush change detection is normally not needed. It is here due to interference from NgDoc lib
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeopleFormComponent implements OnInit, ExpansionRowRenderer<People> {
  row!: People;
  column!: PropertyColumn<People>;
  close!: Function;
  ready = false;

  form = this.fb.group({
    name: [''],
    email: ['']
  })

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.ready = true;
    this.form.setValue({
      name: this.row.name,
      email: this.row.email || ''
    })
  }

  save() {
    this.row.name = this.form.controls.name.value || ''    
    this.row.email = this.form.controls.email.value || ''

    this.close()
  }
}