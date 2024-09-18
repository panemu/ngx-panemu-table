import { Component, ElementRef, HostBinding, Inject, Input, OnInit, Optional } from "@angular/core";
import { ResizableDirective } from "./resizable.directive";
import { getColElement, initTableWidth, setElementWidth } from "./util";

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
    this.colElement = getColElement(this.table.nativeElement, this.columnId);
    if (+(this.resizable) > 0) {
      setElementWidth(+this.resizable, this.colElement);
    }
  }

  onResize(width: any) {
    setElementWidth(this.originalColumnWidth + width, this.colElement);

    this.resetTableWidth(width)
  }

  onStart() {
    this.originalColumnWidth = this.myElement.nativeElement.offsetWidth;
    this.originalTableWidth = this.table.nativeElement.offsetWidth;
    if (!this.table.nativeElement.hasAttribute('resized')) {
      initTableWidth(this.table.nativeElement)
    }
    this.table.nativeElement.setAttribute('resized','');
    
  }

  resetTableWidth(widthChange: number) {
    this.table.nativeElement.style.width = `${this.originalTableWidth + widthChange}px`;
  }
}