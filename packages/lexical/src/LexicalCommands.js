/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {ElementFormatType, LexicalCommand, TextFormatType} from 'lexical';

export function createCommand<T>(type): LexicalCommand<T> {
  // $FlowFixMe: avoid freezing the object for perf reasons
  return {type};
}

export const SELECTION_CHANGE_COMMAND: LexicalCommand<void> = createCommand('selection_change');
export const CLICK_COMMAND: LexicalCommand<MouseEvent> = createCommand('click');
export const DELETE_CHARACTER_COMMAND: LexicalCommand<boolean> =
  createCommand('delete_character');
export const INSERT_LINE_BREAK_COMMAND: LexicalCommand<boolean> =
  createCommand('insert_line_break');
export const INSERT_PARAGRAPH_COMMAND: LexicalCommand<void> = createCommand('insert_paragraph');
export const INSERT_TEXT_COMMAND: LexicalCommand<string> = createCommand('insert_text');
export const PASTE_COMMAND: LexicalCommand<ClipboardEvent> = createCommand('paste');
export const REMOVE_TEXT_COMMAND: LexicalCommand<void> = createCommand('remove_text');
export const DELETE_WORD_COMMAND: LexicalCommand<boolean> = createCommand('delete_word');
export const DELETE_LINE_COMMAND: LexicalCommand<boolean> = createCommand('delete_line');
export const FORMAT_TEXT_COMMAND: LexicalCommand<TextFormatType> =
  createCommand('format_text');
export const UNDO_COMMAND: LexicalCommand<void> = createCommand('undo');
export const REDO_COMMAND: LexicalCommand<void> = createCommand('redo');
export const KEY_ARROW_RIGHT_COMMAND: LexicalCommand<KeyboardEvent> =
  createCommand('key_arrow_right');
export const KEY_ARROW_LEFT_COMMAND: LexicalCommand<KeyboardEvent> =
  createCommand('key_arrow_left');
export const KEY_ARROW_UP_COMMAND: LexicalCommand<KeyboardEvent> =
  createCommand('key_arrow_up');
export const KEY_ARROW_DOWN_COMMAND: LexicalCommand<KeyboardEvent> =
  createCommand('key_arrow_down');
export const KEY_ENTER_COMMAND: LexicalCommand<KeyboardEvent | null> =
  createCommand('key_enter');
export const KEY_BACKSPACE_COMMAND: LexicalCommand<KeyboardEvent> =
  createCommand('key_backspace');
export const KEY_ESCAPE_COMMAND: LexicalCommand<KeyboardEvent> =
  createCommand('key_escape');
export const KEY_DELETE_COMMAND: LexicalCommand<KeyboardEvent> =
  createCommand('key_delete');
export const KEY_TAB_COMMAND: LexicalCommand<KeyboardEvent> = createCommand('key_tab');
export const INDENT_CONTENT_COMMAND: LexicalCommand<void> = createCommand('indent_content');
export const OUTDENT_CONTENT_COMMAND: LexicalCommand<void> = createCommand('outdent_content');
export const DROP_COMMAND: LexicalCommand<DragEvent> = createCommand('drop');
export const FORMAT_ELEMENT_COMMAND: LexicalCommand<ElementFormatType> =
  createCommand('format_element');
export const DRAGSTART_COMMAND: LexicalCommand<DragEvent> = createCommand('dragstart');
export const COPY_COMMAND: LexicalCommand<ClipboardEvent> = createCommand('copy');
export const CUT_COMMAND: LexicalCommand<ClipboardEvent> = createCommand('cut');
export const CLEAR_EDITOR_COMMAND: LexicalCommand<void> = createCommand('clear_editor');
export const CLEAR_HISTORY_COMMAND: LexicalCommand<void> = createCommand('clear_history');
export const CAN_REDO_COMMAND: LexicalCommand<boolean> = createCommand('can_redo');
export const CAN_UNDO_COMMAND: LexicalCommand<boolean> = createCommand('can_undo');
export const FOCUS_COMMAND: LexicalCommand<FocusEvent> = createCommand('focus');
export const BLUR_COMMAND: LexicalCommand<FocusEvent> = createCommand('blur');
export const KEY_MODIFIER_COMMAND: LexicalCommand<KeyboardEvent> =
  createCommand('key_modifier');
