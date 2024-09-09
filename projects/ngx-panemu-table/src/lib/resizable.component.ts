import { Component, ElementRef, HostBinding, Inject, Input, OnInit, Optional } from "@angular/core";
import { ResizableDirective } from "./resizable.directive";

@Component({
  selector: 'th[resizable]',
  templateUrl: 'resizable.component.html',
  standalone: true,
  imports: [ResizableDirective]
})
export class ResizableComponent implements OnInit {
  @Input() @Optional() resizable: number | string = 0;
  @Input({required: true}) columnId!: string;
  @Input() table!: ElementRef<HTMLElement>;
  originalColumnWidth: number = 0
  originalTableWidth: number = 0
  colElement?: HTMLElement
  constructor(private myElement: ElementRef) { }

  ngOnInit(): void {
    this.colElement = this.getColElement(this.columnId);
    if (+(this.resizable) > 0) {
      this.setWidth(+this.resizable, this.colElement);
    }
  }

  onResize(width: any) {
    this.setWidth(this.originalColumnWidth + width, this.colElement);

    this.resetTableWidth(width)
  }

  private getColElement(id: string) {
    return this.table.nativeElement.querySelector(`col[data-col="${id}"]`) as HTMLElement;
  }
  private setWidth(w: number, element?: HTMLElement) {
    if (element) {
      element!.style.width = w + 'px';
    }
  }

  onStart() {
    this.originalColumnWidth = this.myElement.nativeElement.offsetWidth;
    this.originalTableWidth = this.table.nativeElement.offsetWidth;
    if (!this.table.nativeElement.hasAttribute('resized')) {
      this.initTableWidth();
    }
    this.table.nativeElement.setAttribute('resized','');
    
  }

  private initTableWidth() {
    const thList = this.table.nativeElement.querySelectorAll('th[group="false"]');
    let totWidth = 0;
    for (let index = 0; index < thList.length; index++) {
      const element = thList[index] as HTMLElement;
      const colId = element.getAttribute('data-col');
      if (colId) {
        const colEl = this.getColElement(colId);
        this.setWidth(element.offsetWidth, colEl)
      }
      totWidth += element.offsetWidth;
    }
    this.table.nativeElement.style.width = `${totWidth}px`;
  }

  resetTableWidth(widthChange: number) {
    this.table.nativeElement.style.width = `${this.originalTableWidth + widthChange}px`;
  }
}