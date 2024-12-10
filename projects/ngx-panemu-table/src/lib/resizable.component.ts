import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Inject, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from "@angular/core";
import { ResizableDirective } from "./resizable.directive";
import { getColElement, initTableWidth, setElementWidth } from "./util";
import { BaseColumn} from "./column/column";
@Component({
  selector: 'th[resizable]',
  templateUrl: 'resizable.component.html',
  standalone: true,
  imports: [ResizableDirective]
})
export class ResizableComponent implements OnChanges {
  @Input() @Optional() resizable: number | string = 0;
  @Input({required: true}) column!: BaseColumn<any>;
  @Input() table!: ElementRef<HTMLElement>;
  @Output() afterResize = new EventEmitter;
  originalColumnWidth: number = 0
  originalTableWidth: number = 0
  colElement?: HTMLElement;
  width: number = 10;
  constructor(private myElement: ElementRef) { }
  

  ngOnChanges(changes: SimpleChanges): void {
    if (this.table) {
      this.colElement = getColElement(this.table.nativeElement, this.column.__key!);
      if (+(this.resizable) > 0) {
        setElementWidth(+this.resizable, this.colElement);
      }
    }
  }

  onResize(width: any) {
    this.width = this.originalColumnWidth + width;
    setElementWidth(this.width, this.colElement);

    this.resetTableWidth(width)
  }

  onStart() {
    this.originalColumnWidth = this.myElement.nativeElement.offsetWidth;
    this.width = this.originalColumnWidth;
    this.originalTableWidth = this.table.nativeElement.offsetWidth;
    if (!this.table.nativeElement.hasAttribute('resized')) {
      initTableWidth(this.table.nativeElement)
    }
    this.table.nativeElement.setAttribute('resized','');
    
  }

  onEnd() {
    this.column.width = this.width;
    this.afterResize.emit();
  }

  resetTableWidth(widthChange: number) {
    this.table.nativeElement.style.width = `${this.originalTableWidth + widthChange}px`;
  }
}