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

  @HostBinding('style.width.px')
  width: number | null = null;
  @HostBinding('style.max-width.px')
  maxWidth: number | null = null;
  @Input() table!: ElementRef<HTMLElement>;
  originalColumnWidth: number = 0
  originalTableWidth: number = 0

  constructor(private myElement: ElementRef) { }

  ngOnInit(): void {
    if (+(this.resizable) > 0) {
      this.width = +this.resizable;
      this.maxWidth = this.width;
    }
  }

  onResize(width: any) {
    this.width = this.originalColumnWidth + width;
    this.maxWidth = this.width;
    this.resetTableWidth(width)
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
    const thList = this.table.nativeElement.getElementsByTagName('th');
    let totWidth = 0;
    for (let index = 0; index < thList.length; index++) {
      const element: any = thList[index];
      element.style.width = element.offsetWidth + 'px'
      totWidth += element.offsetWidth;
    }
    this.table.nativeElement.style.width = `${totWidth}px`;
  }

  resetTableWidth(widthChange: number) {
    this.table.nativeElement.style.width = `${this.originalTableWidth + widthChange}px`;
  }
}