import { buildTreeNode, compactPreview, getSearchPaths } from './json-utils.js';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createTreeViewController(container) {
  let expandedPaths = new Set(['root']);
  let hasInitializedExpansion = false;
  let currentValue = null;
  let currentTree = null;
  let isCompactView = false;
  let currentSearch = '';

  function collectNodePaths(node, path = []) {
    const currentPath = path.length ? path.join('.') : 'root';
    const paths = [currentPath];

    if (node.type === 'object' || node.type === 'array') {
      const children = Array.isArray(node.value) ? node.value : node.value ?? [];
      children.forEach((child) => {
        paths.push(...collectNodePaths(child, path.concat(child.key ?? '')));
      });
    }

    return paths;
  }

  function toggleExpansion(path) {
    if (expandedPaths.has(path)) {
      expandedPaths.delete(path);
    } else {
      expandedPaths.add(path);
    }

    render(currentValue);
  }

  function render(value) {
    currentValue = value;
    currentTree = buildTreeNode(value);
    container.innerHTML = '';

    if (currentSearch.trim()) {
      const searchQuery = currentSearch.trim().toLowerCase();
      const pathsToOpen = getSearchPaths(currentTree, searchQuery);
      const ancestorPaths = new Set();

      pathsToOpen.forEach((path) => {
        const segments = path.split('.');
        segments.slice(0, -1).forEach((_, index) => {
          ancestorPaths.add(segments.slice(0, index + 1).join('.'));
        });
      });

      expandedPaths = new Set([...ancestorPaths, ...pathsToOpen]);
    } else if (!hasInitializedExpansion) {
      expandedPaths = new Set(['root']);
      hasInitializedExpansion = true;
    }

    if (isCompactView) {
      const compactPreviewCard = document.createElement('div');
      compactPreviewCard.className = 'tree-row';
      compactPreviewCard.innerHTML = `<span class="tree-key">root</span><span class="tree-value object">${escapeHtml(compactPreview(value))}</span>`;
      container.appendChild(compactPreviewCard);
      return;
    }

    if (currentTree.type === 'object' || currentTree.type === 'array') {
      container.appendChild(createTreeBranch(currentTree));
      return;
    }

    const leaf = document.createElement('div');
    leaf.className = 'tree-row';
    leaf.innerHTML = `<span class="tree-key">${escapeHtml(currentTree.key ?? 'root')}</span><span class="tree-value ${currentTree.type}">${escapeHtml(String(currentTree.value))}</span>`;
    container.appendChild(leaf);
  }

  function createTreeBranch(node, path = []) {
    const branch = document.createElement('div');
    branch.className = 'tree-branch';

    const currentPath = path.length ? path.join('.') : 'root';
    const isExpandable = node.type === 'object' || node.type === 'array';
    const isExpanded = currentPath === 'root' ? true : expandedPaths.has(currentPath);
    const label = node.key === null ? 'root' : String(node.key);

    if (!isExpandable) {
      const leaf = document.createElement('div');
      leaf.className = 'tree-row';
      leaf.innerHTML = `<span class="tree-key">${escapeHtml(label)}</span><span class="tree-value ${node.type}">${escapeHtml(String(node.value))}</span>`;
      branch.appendChild(leaf);
      return branch;
    }

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'tree-row tree-toggle';
    header.innerHTML = `<span class="tree-chevron">${isExpanded ? '▾' : '▸'}</span><span class="tree-key">${escapeHtml(label)}</span><span class="tree-meta">${node.type === 'object' ? '{…}' : '[…]'}</span>`;

    header.addEventListener('click', () => {
      toggleExpansion(currentPath);
    });

    branch.appendChild(header);

    if (isExpanded) {
      const children = document.createElement('div');
      children.className = 'tree-children';
      const childNodes = Array.isArray(node.value) ? node.value : node.value ?? [];
      childNodes.forEach((child) => children.appendChild(createTreeBranch(child, path.concat(child.key ?? ''))));
      branch.appendChild(children);
    }

    return branch;
  }

  return {
    setValue(value) {
      render(value);
    },
    setCompactView(value) {
      isCompactView = value;
      render(currentValue);
    },
    setSearch(value) {
      currentSearch = value;
      render(currentValue);
    },
    expandAll() {
      if (!currentTree) {
        return;
      }

      expandedPaths = new Set(collectNodePaths(currentTree));
      render(currentValue);
    },
    collapseAll() {
      expandedPaths.clear();
      render(currentValue);
    }
  };
}
