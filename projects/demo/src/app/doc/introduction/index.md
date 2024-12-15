---
keyword: IntroductionPage
---
<br>
<br>
<br>
<div align="center" class="flex flex-col">
    <img src="assets/ngx-panemu-table_logo.png" alt="Logo" style="height: 150px">
    <img src="assets/ngx-panemu-table_text.png" alt="Logo" style="height: 64px">
</div>

<br>
<br>
<br>

NgxPanemuTable is an Angular table component. It is designed to be easy to use. Most work will be in typescript file, while
the html file only needs to have a very simple `panemu-table` tag.


<iframe
  width="560px"
  height="315px"
  src="https://www.youtube.com/embed/Qs4VbpteiRk"
  title="NgxPanemuTable demo"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen>
</iframe>

[See on Stackblitz](https://stackblitz.com/edit/stackblitz-starters-krause?file=src%2Fmain.ts)

## Features

- Declarative table definition in typescript. Very little code in html needed.
- Sane defaults that can be overriden app-wide and per table basis.
- Pagination. More flexible than common pagination.
    - Previous page of first page overflow to last page and vice versa.
    - User can input arbitrary range.
    - Client or server side. Client side pagination is provided, server side implementation is up to you.

- Filtering.
    - Provided filter editors for string, date and key-value pair.
    - You can create custom filter editor.
    - Support `between` operator using dot and comma. Dot represent `greater/less and equal`. Comma represent `greater/less` whithout equal.
```
amount: 1.,10 is translated to `amount >= 1 and amount < 10`
amount: 1,.10 is translated to `amount > 1 and amount <= 10`
```
- Row Grouping.
   - Support group level pagination.
   - Customizable row group header and footer. See `*CustomRowGroupPage`.
- Column header
  - Group multiple columns under one cell header.
  - Support custom cell header renderer. You can put anything in column header.
- Column Resizable.
- User can change column visibility, position and stickiness at runtime. See `PanemuSettingComponent`.
- Save table states:
  - Columns visibility, position and stickiness.
  - Filter, grouping, sorting and pagination.
  
  If user changes any of those, go to other and back, the states are restored. See `*PersistStatesPage`.
- Customizable table cell.
  - Support custom cell using `ng-template` or angular component.
  - Support custom cell formatting and styling
  - Cell expansion. See `*CellExpansionPage`. 
- Sticky column, header and footer
- Cell colspan and rowspan. See `*CellSpanningPage`.
- Export to CSV. See `PanemuTableController.getcsvdata` .
- Handle huge data using [virtual scroll](usages/virtual-scroll). Now it doesn't support variable row height. But it will in the future.

{{ NgDocActions.demo("AllFeaturesClientComponent", {expanded: true}) }}

## More In The Future

These features are not developed yet. Please create a ticket in [our repository](https://github.com/panemu/ngx-panemu-table) if you need them so we know what to prioritize.

- Global search.
- Virtual scroll with variable row height.

## Releases:

### v.0.2.0

* Transpose selected row.

### v.0.0.9

* New `PanemuSettingComponent` as the UI to change columns visibility, position and stickiness.
* Save table states (column structure, pagination, filtering, sorting and grouping)
* Support cell rowspan and colspan using `RowRenderer`.

### v.0.0.7

* Virtual scroll
* Table footer
* RowGroup now customizable and can have footer

### Support Us

<a href='https://ko-fi.com/s/60c660f1f0' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>


## About Panemu

We are software development company. [Contact us](https://panemu.com) if you want to build a top notch software.