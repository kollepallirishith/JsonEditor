export function parseJson(raw) {
  try {
    return {
      ok: true,
      value: JSON.parse(raw),
      error: null
    };
  } catch (error) {
    return {
      ok: false,
      value: null,
      error: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
}

export function formatJson(raw) {
  const parsed = parseJson(raw);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  return JSON.stringify(parsed.value, null, 2);
}

export function minifyJson(raw) {
  const parsed = parseJson(raw);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  return JSON.stringify(parsed.value);
}

export function getJsonType(value) {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
}

export function compactPreview(value, maxDepth = 2, depth = 0) {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    if (depth >= maxDepth) {
      return `[${value.length} item${value.length === 1 ? '' : 's'}]`;
    }

    const preview = value.slice(0, 3).map((item) => compactPreview(item, maxDepth, depth + 1)).join(', ');
    return `[${preview}${value.length > 3 ? ', …' : ''}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return '{}';
    }

    if (depth >= maxDepth) {
      return `{${entries.length} key${entries.length === 1 ? '' : 's'}}`;
    }

    const preview = entries.slice(0, 3).map(([key, entry]) => `${key}: ${compactPreview(entry, maxDepth, depth + 1)}`).join(', ');
    return `{${preview}${entries.length > 3 ? ', …' : ''}}`;
  }

  return String(value);
}

export function buildTreeNode(value, key = null) {
  if (value === null) {
    return { key, type: 'null', value: 'null' };
  }

  if (Array.isArray(value)) {
    return {
      key,
      type: 'array',
      value: value.map((item, index) => buildTreeNode(item, index))
    };
  }

  if (typeof value === 'object') {
    return {
      key,
      type: 'object',
      value: Object.entries(value).map(([childKey, childValue]) => buildTreeNode(childValue, childKey))
    };
  }

  return {
    key,
    type: getJsonType(value),
    value
  };
}

export function getSearchPaths(node, query, path = []) {
  const results = [];
  const currentPath = path.length ? path.join('.') : 'root';
  const key = node.key === null ? 'root' : String(node.key);
  const valueText = String(node.value ?? '');
  const haystack = `${key} ${valueText}`.toLowerCase();

  if (query && haystack.includes(query)) {
    results.push(currentPath);
    return results;
  }

  if (node.type === 'object' || node.type === 'array') {
    const children = Array.isArray(node.value) ? node.value : node.value ?? [];
    children.forEach((child) => {
      results.push(...getSearchPaths(child, query, path.concat(child.key ?? '')));
    });
  }

  return results;
}
