import { Component, Input, OnInit } from '@angular/core';
import { BaseColumn, PanemuBusyIndicatorComponent, PropertyColumn, ExpansionRowRenderer } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-people-form',
  templateUrl: 'people-form.component.html',
  standalone: true,
  imports: [PanemuBusyIndicatorComponent, ReactiveFormsModule]
})
export class PeopleFormComponent implements OnInit, ExpansionRowRenderer<People> {
  @Input() row!: People;
  @Input() column!: PropertyColumn<People>;
  @Input() close!: Function;
  ready = false;

  form = this.fb.group({
    name: [''],
    email: ['']
  })

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    setTimeout(() => {
      this.ready = true;
      this.form.setValue({
        name: this.row.name,
        email: this.row.email || ''
      })
    }, 500);
  }

  save() {
    this.row.name = this.form.controls.name.value || ''    
    this.row.email = this.form.controls.email.value || ''

    this.close()
  }
}