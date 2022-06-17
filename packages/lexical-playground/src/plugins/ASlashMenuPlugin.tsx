import * as React from 'react';
import {useCallback, useEffect, useRef} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {createPortal} from 'react-dom';
import {CONTROLLED_TEXT_INSERTION_COMMAND} from 'lexical/src';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  RangeSelection,
  TextNode,
} from 'lexical';

export default function SlashMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const slashMenuDivRef = useRef<HTMLDivElement>();
  // const updateSlashMenu = useCallback(()=> {
  //     return true
  // },[])
  useEffect(() => {
    // editor.registerTextContentListener((text)=> {
    //   const selection = $getSelection();
    //   console.log(text)
    // })
    editor.registerNodeTransform(TextNode, (node) => {
      if (window.event instanceof InputEvent) {
        const event = window.event as InputEvent;
        if (event.inputType === 'insertText' && event.data === '/') {
          console.log('弹出快速插入菜单', node);
          const selection = $getSelection();
          const {anchor, focus} = selection as RangeSelection;
          if (anchor.key === focus.key && focus.offset === 1) {
            if (anchor.key === $getRoot().getFirstDescendant().getKey()) {
              console.log('在最开始处');
            }
          }
        }
      }
    });
    // editor.registerCommand(
    //   CONTROLLED_TEXT_INSERTION_COMMAND,
    //   (eventOrText) => {
    //     const selection = $getSelection();
    //     let str;
    //     if (!$isRangeSelection(selection)) {
    //       return false;
    //     }
    //
    //     if (typeof eventOrText === 'string') {
    //       str = eventOrText;
    //     }
    //     if (str === '/') {
    //     }
    //     console.error(eventOrText);
    //     return false;
    //   },
    //   COMMAND_PRIORITY_CRITICAL,
    // );
  }, []);
  return createPortal(
    <div ref={slashMenuDivRef} className="character-style-popup">
      块列表
    </div>,
    document.body,
  );
}
