import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatJson,
  minifyJson,
  parseJson,
  getJsonType,
  compactPreview,
  getSearchPaths
} from '../src/json-utils.js';

test('formats JSON with indentation', () => {
  assert.equal(formatJson('{"name":"Ada","age":37}'), '{\n  "name": "Ada",\n  "age": 37\n}');
});

test('minifies JSON', () => {
  assert.equal(minifyJson('{\n  "name": "Ada"\n}'), '{"name":"Ada"}');
});

test('parses valid JSON', () => {
  const result = parseJson('{"ok": true}');
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { ok: true });
});

test('reports invalid JSON', () => {
  const result = parseJson('{"ok":');
  assert.equal(result.ok, false);
  assert.match(result.error, /Unexpected/);
});

test('detects primitive JSON types', () => {
  assert.equal(getJsonType('hello'), 'string');
  assert.equal(getJsonType(42), 'number');
  assert.equal(getJsonType(true), 'boolean');
  assert.equal(getJsonType(null), 'null');
});

test('creates a compact preview for nested values', () => {
  assert.equal(compactPreview({ project: 'JsonEditor', features: ['format', 'validate'] }), '{project: "JsonEditor", features: ["format", "validate"]}');
});

test('finds the path to a matching key or value', () => {
  const tree = {
    project: 'JsonEditor',
    settings: {
      darkMode: true
    }
  };

  const node = {
    key: null,
    type: 'object',
    value: [
      { key: 'project', type: 'string', value: 'JsonEditor' },
      { key: 'settings', type: 'object', value: [{ key: 'darkMode', type: 'boolean', value: true }] }
    ]
  };

  assert.deepEqual(getSearchPaths(node, 'darkmode'), ['settings.darkMode']);
  assert.deepEqual(getSearchPaths(node, 'jsoneditor'), ['project']);
});
