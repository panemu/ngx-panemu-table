<div align="center">
  <a href="https://github.com/panemu/ngx-panemu-table">
    <img src="https://ngx-panemu-table.panemu.com/assets/ngx-panemu-table_logo.png" alt="Logo" height="150px">
  </a>
<h1 align="center" style="margin-bottom: 0; border-bottom: 0">NgxPanemuTable</h1>
  <p align="center">
    Advanced table component for Angular. Highly customizable, with sane defaults.
    <br />
    <a href="https://ngx-panemu-table.panemu.com/">Documentation</a>
    ·
    <a href="https://github.com/panemu/ngx-panemu-table/issues">Issues</a>
  </p>
</div>

NgxPanemuTable is an Angular table component designed to be easy to use. Most of the work happens in the TypeScript file; the template only needs a simple `panemu-table` tag.

## Features

- Declarative columns in TypeScript with sane defaults
- Pagination (client or server side) with flexible range input
- Filtering with provided editors to build complex query. Supports nested AND/OR predicates
- Sorting (including multi-column with Ctrl key)
- Row grouping with group-level pagination, customizable header/footer
- Column grouping (multiple columns under one header cell)
- Column resizing, visibility, ordering and stickiness — persistable across navigation
- Sticky columns, header and footer
- Cell colspan/rowspan, cell expansion, custom cell and header renderers
- Inline editing
- CSV export
- Virtual scroll for large datasets
- Localisation via Angular `LOCALE_ID` and a `LabelTranslation` interface

## Installation

```bash
npm install ngx-panemu-table
```

Peer dependencies: `@angular/common`, `@angular/core`, `@angular/material` (version range 19 – 21).

Full setup instructions and usage examples: <https://ngx-panemu-table.panemu.com/>

## Releases

See the [Releases section](https://ngx-panemu-table.panemu.com/) on the docs site for the changelog. v0.7.0 includes breaking changes — see the migration notes on the introduction page before upgrading.

## Support Us

<a href='https://ko-fi.com/s/60c660f1f0' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
