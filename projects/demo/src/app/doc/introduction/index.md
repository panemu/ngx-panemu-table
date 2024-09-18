---
keyword: IntroductionPage
---
<br>
<br>
<br>
<div align="center" class="flex flex-col">
    <img src="assets/ngx-panemu-table_logo.png" alt="Logo" height="150px">
    <img src="assets/ngx-panemu-table_text.png" alt="Logo" height="64px">

</div>

<br>
<br>
<br>

> **Note**
> ✨ Cell Expansion (v.0.0.6).See `*CellExpansionPage`.
> <br>✨ Export to CSV (v.0.0.6). See `PanemuTableController.getcsvdata`

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

- Pagination. More flexible than common pagination.
- Filtering. Support `between` operator using dot and comma. Dot represent `greater/less and equal`. Comma represent `greater/less`.
```
amount: 1.,10 is translated to `amount >= 1 and amount < 10`
amount: 1,.10 is translated to `amount > 1 and amount <= 10`
```
- Searching
- Grouping
- Column Resizable
- Customizable table cell, header, row group, filter editor, css styles and classes etc.
- Sticky column
- Group multiple columns under one cell header ✨
- Cell Expansion (v.0.0.6). See `*CellExpansionPage`. ✨ 
- Export to CSV (v.0.0.6). See `PanemuTableController.getcsvdata` . ✨ 


{{ NgDocActions.demo("AllFeaturesClientComponent", {expanded: true}) }}

{{ NgDocActions.demo("BasicComponent") }}

## More In The Future

These features are not developed yet. Please create a ticket in [our repository](https://github.com/panemu/ngx-panemu-table) if you need them so we know what to prioritize.

- Filter editor for all data type including Date, DateTime and Map. It should allow user to change the filter value without clearing the filter.
- Global search
- Table footer
- Virtual scroll to display large data
- ~~Column grouping (nested column)~~ supported since v.0.0.5
- Column reorder
- ~~Export~~ csv export is supported since v.0.0.6
- Save columns position, width and visibility

## About Panemu

We are software development company. [Contact us](https://panemu.com) if you want to build a top notch software.