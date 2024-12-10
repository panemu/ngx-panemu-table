import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, signal } from '@angular/core';
import { PanemuBusyIndicatorComponent, PropertyColumn, ExpansionRowRenderer } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-people-form',
  templateUrl: 'people-form.component.html',
  standalone: true,
  imports: [PanemuBusyIndicatorComponent, ReactiveFormsModule],
})
export class PeopleFormComponent implements OnInit, ExpansionRowRenderer<People> {
  row!: People;
  column!: PropertyColumn<People>;
  close!: Function;
  ready = signal(false);

  form = this.fb.group({
    name: [''],
    email: ['']
  })

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    setTimeout(() => {
      this.ready.set(true);
    }, 1000);
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