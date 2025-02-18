/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  EditorThemeClasses,
  LexicalNode,
  NodeKey,
  ParagraphNode,
  RangeSelection,
} from 'lexical';

import {
  addClassNamesToElement,
  removeClassNamesFromElement,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $isElementNode,
  $isParagraphNode,
  ElementNode,
} from 'lexical';
import invariant from 'shared/invariant';

import {$createListNode, $isListNode} from './';
import {$handleIndent, $handleOutdent} from './formatList';

export class ListItemNode extends ElementNode {
  static getType(): string {
    return 'listitem';
  }

  static clone(node: ListItemNode): ListItemNode {
    return new ListItemNode(node.__key);
  }

  constructor(key?: NodeKey): void {
    super(key);
  }

  // View

  createDOM<EditorContext>(config: EditorConfig<EditorContext>): HTMLElement {
    const element = document.createElement('li');
    element.value = getListItemValue(this);
    $setListItemThemeClassNames(element, config.theme, this);
    return element;
  }

  updateDOM<EditorContext>(
    prevNode: ListItemNode,
    dom: HTMLElement,
    config: EditorConfig<EditorContext>,
  ): boolean {
    //$FlowFixMe - this is always HTMLListItemElement
    dom.value = getListItemValue(this);
    $setListItemThemeClassNames(dom, config.theme, this);
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      li: (node: Node) => ({
        conversion: convertListItemElement,
        priority: 0,
      }),
    };
  }

  // Mutation

  append(...nodes: LexicalNode[]): ListItemNode {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if ($isElementNode(node) && this.canMergeWith(node)) {
        const children = node.getChildren();
        this.append(...children);
        node.remove();
      } else {
        super.append(node);
      }
    }
    return this;
  }

  replace<N: LexicalNode>(replaceWithNode: N): N {
    if ($isListItemNode(replaceWithNode)) {
      return super.replace(replaceWithNode);
    }
    const list = this.getParentOrThrow();
    if ($isListNode(list)) {
      const childrenKeys = list.__children;
      const childrenLength = childrenKeys.length;
      const index = childrenKeys.indexOf(this.__key);
      if (index === 0) {
        list.insertBefore(replaceWithNode);
      } else if (index === childrenLength - 1) {
        list.insertAfter(replaceWithNode);
      } else {
        // Split the list
        const newList = $createListNode(list.getTag());
        const children = list.getChildren();
        for (let i = index + 1; i < childrenLength; i++) {
          const child = children[i];
          newList.append(child);
        }
        list.insertAfter(replaceWithNode);
        replaceWithNode.insertAfter(newList);
      }
      this.remove();
      if (childrenLength === 1) {
        list.remove();
      }
    }
    return replaceWithNode;
  }

  insertAfter(node: LexicalNode): LexicalNode {
    const siblings = this.getNextSiblings();
    if ($isListItemNode(node)) {
      // mark subsequent list items dirty so we update their value attribute.
      siblings.forEach((sibling) => sibling.markDirty());
      return super.insertAfter(node);
    }

    const listNode = this.getParentOrThrow();
    if (!$isListNode(listNode)) {
      invariant(
        false,
        'insertAfter: list node is not parent of list item node',
      );
    }

    // Attempt to merge if the list is of the same type.
    if ($isListNode(node) && node.getTag() === listNode.getTag()) {
      let child = node;
      const children = node.getChildren();
      for (let i = children.length - 1; i >= 0; i--) {
        child = children[i];
        this.insertAfter(child);
      }
      return child;
    }

    // Otherwise, split the list
    // Split the lists and insert the node in between them
    listNode.insertAfter(node);
    if (siblings.length !== 0) {
      const newListNode = $createListNode(listNode.getTag());
      siblings.forEach((sibling) => newListNode.append(sibling));
      node.insertAfter(newListNode);
    }
    return node;
  }

  insertNewAfter(): ListItemNode | ParagraphNode {
    const newElement = $createListItemNode();
    this.insertAfter(newElement);

    return newElement;
  }

  collapseAtStart(selection: RangeSelection): true {
    const paragraph = $createParagraphNode();
    const children = this.getChildren();
    children.forEach((child) => paragraph.append(child));
    const listNode = this.getParentOrThrow();
    const listNodeParent = listNode.getParentOrThrow();
    const isIndented = $isListItemNode(listNodeParent);
    if (listNode.getChildrenSize() === 1) {
      if (isIndented) {
        // if the list node is nested, we just want to remove it,
        // effectively unindenting it.
        listNode.remove();
        listNodeParent.select();
      } else {
        listNode.replace(paragraph);
        // If we have selection on the list item, we'll need to move it
        // to the paragraph
        const anchor = selection.anchor;
        const focus = selection.focus;
        const key = paragraph.getKey();
        if (anchor.type === 'element' && anchor.getNode().is(this)) {
          anchor.set(key, anchor.offset, 'element');
        }
        if (focus.type === 'element' && focus.getNode().is(this)) {
          focus.set(key, focus.offset, 'element');
        }
      }
    } else {
      listNode.insertBefore(paragraph);
      this.remove();
    }
    return true;
  }

  getIndent(): number {
    // ListItemNode should always have a ListNode for a parent.
    let listNodeParent = this.getParentOrThrow().getParentOrThrow();
    let indentLevel = 0;
    while ($isListItemNode(listNodeParent)) {
      listNodeParent = listNodeParent.getParentOrThrow().getParentOrThrow();
      indentLevel++;
    }
    return indentLevel;
  }

  setIndent(indent: number): this {
    let currentIndent = this.getIndent();
    while (currentIndent !== indent) {
      if (currentIndent < indent) {
        $handleIndent([this]);
        currentIndent++;
      } else {
        $handleOutdent([this]);
        currentIndent--;
      }
    }
    return this;
  }

  insertBefore(nodeToInsert: LexicalNode): LexicalNode {
    const siblings = this.getNextSiblings();
    if ($isListItemNode(nodeToInsert)) {
      // mark subsequent list items dirty so we update their value attribute.
      siblings.forEach((sibling) => sibling.markDirty());
    }
    return super.insertBefore(nodeToInsert);
  }

  canInsertAfter(node: LexicalNode): boolean {
    return $isListItemNode(node);
  }

  canReplaceWith(replacement: LexicalNode): boolean {
    return $isListItemNode(replacement);
  }

  canMergeWith(node: LexicalNode): boolean {
    return $isParagraphNode(node) || $isListItemNode(node);
  }
}

function getListItemValue(listItem: ListItemNode): number {
  const list = listItem.getParent();

  let value = 1;
  if (list != null) {
    if (!$isListNode(list)) {
      invariant(
        false,
        'getListItemValue: list node is not parent of list item node',
      );
    } else {
      value = list.getStart();
    }
  }

  const siblings = listItem.getPreviousSiblings();
  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i];
    if ($isListItemNode(sibling) && !$isListNode(sibling.getFirstChild())) {
      value++;
    }
  }
  return value;
}

function $setListItemThemeClassNames(
  dom: HTMLElement,
  editorThemeClasses: EditorThemeClasses,
  node: ListItemNode,
): void {
  const classesToAdd = [];
  const classesToRemove = [];
  const listTheme = editorThemeClasses.list;
  const listItemClassName = listTheme ? listTheme.listitem : undefined;
  let nestedListItemClassName;
  if (listTheme && listTheme.nested) {
    nestedListItemClassName = listTheme.nested.listitem;
  }

  if (listItemClassName !== undefined) {
    const listItemClasses = listItemClassName.split(' ');
    classesToAdd.push(...listItemClasses);
  }

  if (nestedListItemClassName !== undefined) {
    const nestedListItemClasses = nestedListItemClassName.split(' ');
    if (node.getChildren().some((child) => $isListNode(child))) {
      classesToAdd.push(...nestedListItemClasses);
    } else {
      classesToRemove.push(...nestedListItemClasses);
    }
  }

  if (classesToAdd.length > 0) {
    addClassNamesToElement(dom, ...classesToAdd);
  }

  if (classesToRemove.length > 0) {
    removeClassNamesFromElement(dom, ...classesToRemove);
  }
}

function convertListItemElement(domNode: Node): DOMConversionOutput {
  return {node: $createListItemNode()};
}

export function $createListItemNode(): ListItemNode {
  return new ListItemNode();
}

export function $isListItemNode(node: ?LexicalNode): boolean %checks {
  return node instanceof ListItemNode;
}
