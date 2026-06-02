import { Column, ColumnType, MapColumn } from "../../column/column";

export type Op =
  | 'eq' | 'neq'
  | 'lt' | 'lte' | 'gt' | 'gte'
  | 'in' | 'notIn'
  | 'contains' | 'startsWith' | 'endsWith'
  | 'isNull' | 'isNotNull';

export type LogicalKind = 'and' | 'or';

export type ScalarValue = string | number | boolean;

export interface AndPredicate    { type: 'and';       operands: Predicate[]; }
export interface OrPredicate     { type: 'or';        operands: Predicate[]; }
export interface EqPredicate     { type: 'eq';        field: string; value: ScalarValue; caseInsensitive?: boolean; }
export interface NeqPredicate    { type: 'neq';       field: string; value: ScalarValue; caseInsensitive?: boolean; }
export interface LtPredicate     { type: 'lt';        field: string; value: ScalarValue; }
export interface LtePredicate    { type: 'lte';       field: string; value: ScalarValue; }
export interface GtPredicate     { type: 'gt';        field: string; value: ScalarValue; }
export interface GtePredicate    { type: 'gte';       field: string; value: ScalarValue; }
export interface InPredicate     { type: 'in';        field: string; values: ScalarValue[]; }
export interface NotInPredicate  { type: 'notIn';     field: string; values: ScalarValue[]; }
export interface LikePredicate   { type: 'like';      field: string; pattern: string; caseInsensitive: boolean; }
export interface IsNullPredicate    { type: 'isNull';    field: string; }
export interface IsNotNullPredicate { type: 'isNotNull'; field: string; }

export type Predicate =
  | AndPredicate | OrPredicate
  | EqPredicate | NeqPredicate
  | LtPredicate | LtePredicate | GtPredicate | GtePredicate
  | InPredicate | NotInPredicate
  | LikePredicate
  | IsNullPredicate | IsNotNullPredicate;

//export type FieldPredicate = Exclude<Predicate, AndPredicate | OrPredicate | InPredicate | NotInPredicate>;

export interface GroupNode {
  kind: 'group';
  logical: LogicalKind;
  children: Node[];
}

export interface ConditionNode {
  kind: 'condition';
  field: string;
  op: Op;
  value: string;
  values: string;
  caseInsensitive: boolean;
}

export type Node = GroupNode | ConditionNode;

type SearchableColumnType = Exclude<ColumnType, 'tick' | 'computed' | 'group'>;
export const OPS_BY_TYPE: Record<SearchableColumnType, Op[]> = {
  string: ['eq', 'neq', 'contains', 'startsWith', 'endsWith', 'in', 'notIn', 'isNull', 'isNotNull'],
  int: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in', 'notIn', 'isNull', 'isNotNull'],
  decimal: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in', 'notIn', 'isNull', 'isNotNull'],
  boolean: ['eq', 'neq', 'isNull', 'isNotNull'],
  date: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'isNull', 'isNotNull'],
  datetime: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'isNull', 'isNotNull'],
  map: ['eq', 'neq', 'in', 'notIn', 'isNull', 'isNotNull'],
};

export const OP_LABELS: Record<Op, string> = {
  eq: '=',
  neq: '≠',
  lt: '<',
  lte: '≤',
  gt: '>',
  gte: '≥',
  in: 'in',
  notIn: 'not in',
  contains: 'contains',
  startsWith: 'starts with',
  endsWith: 'ends with',
  isNull: 'is null',
  isNotNull: 'is not null',
};

export type SearchableColumn = Column<any> | MapColumn<any>;

export function newCondition(field: SearchableColumn): ConditionNode {
  return {
    kind: 'condition',
    field: field.field as string,
    op: OPS_BY_TYPE[field.type!][0],
    value: '',
    values: '',
    caseInsensitive: field.type === 'string',
  };
}

export function newGroup(logical: LogicalKind = 'and'): GroupNode {
  return { kind: 'group', logical, children: [] };
}

function scalarToString(v: ScalarValue): string {
  return typeof v === 'string' ? v : String(v);
}

function unwrapLike(pattern: string): { op: 'contains' | 'startsWith' | 'endsWith'; value: string } {
  const lead = pattern.startsWith('%');
  const trail = pattern.endsWith('%');
  if (lead && trail) return { op: 'contains', value: pattern.slice(1, -1) };
  if (trail) return { op: 'startsWith', value: pattern.slice(0, -1) };
  if (lead) return { op: 'endsWith', value: pattern.slice(1) };
  return { op: 'contains', value: pattern };
}

function predicateToNode(p: Predicate): Node {
  if (p.type === 'and' || p.type === 'or') {
    return {
      kind: 'group',
      logical: p.type,
      children: p.operands.map(predicateToNode),
    };
  }
  switch (p.type) {
    case 'isNull':
    case 'isNotNull':
      return { kind: 'condition', field: p.field, op: p.type, value: '', values: '', caseInsensitive: false };
    case 'eq':
    case 'neq':
      return {
        kind: 'condition',
        field: p.field,
        op: p.type,
        value: scalarToString(p.value),
        values: '',
        caseInsensitive: p.caseInsensitive ?? false,
      };
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte':
      return {
        kind: 'condition',
        field: p.field,
        op: p.type,
        value: scalarToString(p.value),
        values: '',
        caseInsensitive: false,
      };
    case 'in':
    case 'notIn':
      return {
        kind: 'condition',
        field: p.field,
        op: p.type,
        value: '',
        values: p.values.map(scalarToString).join(', '),
        caseInsensitive: false,
      };
    case 'like': {
      const { op, value } = unwrapLike(p.pattern);
      return { kind: 'condition', field: p.field, op, value, values: '', caseInsensitive: p.caseInsensitive };
    }
  }
}

// A non-group root predicate is wrapped in an implicit AND group of one,
// since the builder's root is always a group.
export function fromPredicate(p: Predicate): GroupNode {
  if (p.type === 'and' || p.type === 'or') {
    return {
      kind: 'group',
      logical: p.type,
      children: p.operands.map(predicateToNode),
    };
  }
  return { kind: 'group', logical: 'and', children: [predicateToNode(p)] };
}

function coerce(raw: string, type: SearchableColumnType): ScalarValue | null {
  if (raw === '' || raw == null) return null;
  switch (type) {
    case 'int':
    case 'decimal': {
      const n = Number(raw);
      return Number.isNaN(n) ? raw : n;
    }
    case 'boolean':
      return raw === 'true';
    default:
      return raw;
  }
}

function splitList(raw: string, type: SearchableColumnType): ScalarValue[] {
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => coerce(s, type))
    .filter((v): v is ScalarValue => v !== null);
}

export function toPredicate(node: Node, fields: Map<string, SearchableColumn>): Predicate | null {
  if (node.kind === 'group') {
    const operands = node.children
      .map(c => toPredicate(c, fields))
      .filter((p): p is Predicate => p !== null);
    if (operands.length === 0) return null;
    if (operands.length === 1) return operands[0];
    return { type: node.logical, operands };
  }

  const fd = fields.get(node.field);
  if (!fd) return null;
  const t = fd.type!;

  switch (node.op) {
    case 'isNull':
    case 'isNotNull':
      return { type: node.op, field: node.field };

    case 'eq':
    case 'neq': {
      const v = coerce(node.value, t);
      if (v === null) return null;
      const base = { type: node.op, field: node.field, value: v };
      return t === 'string' && node.caseInsensitive
        ? { ...base, caseInsensitive: true }
        : base;
    }

    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte': {
      const v = coerce(node.value, t);
      if (v === null) return null;
      return { type: node.op, field: node.field, value: v };
    }

    case 'in':
    case 'notIn': {
      const values = splitList(node.values, t);
      if (values.length === 0) return null;
      return { type: node.op, field: node.field, values };
    }

    case 'contains':
    case 'startsWith':
    case 'endsWith': {
      if (!node.value) return null;
      let pattern = node.value;
      if (node.op === 'contains') pattern = `%${node.value}%`;
      else if (node.op === 'startsWith') pattern = `${node.value}%`;
      else pattern = `%${node.value}`;
      return {
        type: 'like',
        field: node.field,
        pattern,
        caseInsensitive: node.caseInsensitive,
      };
    }
  }
}
