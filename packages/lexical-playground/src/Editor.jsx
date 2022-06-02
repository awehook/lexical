/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {$createLinkNode} from '@lexical/link';
import {$createListItemNode, $createListNode} from '@lexical/list';
import AutoFocusPlugin from '@lexical/react/LexicalAutoFocusPlugin';
import AutoScrollPlugin from '@lexical/react/LexicalAutoScrollPlugin';
import CharacterLimitPlugin from '@lexical/react/LexicalCharacterLimitPlugin';
import LexicalClearEditorPlugin from '@lexical/react/LexicalClearEditorPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import HashtagsPlugin from '@lexical/react/LexicalHashtagPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import LinkPlugin from '@lexical/react/LexicalLinkPlugin';
import ListPlugin from '@lexical/react/LexicalListPlugin';
import LexicalMarkdownShortcutPlugin from '@lexical/react/LexicalMarkdownShortcutPlugin';
import PlainTextPlugin from '@lexical/react/LexicalPlainTextPlugin';
import RichTextPlugin from '@lexical/react/LexicalRichTextPlugin';
import TablesPlugin from '@lexical/react/LexicalTablePlugin';
import {$createHeadingNode, $createQuoteNode} from '@lexical/rich-text';
import {$createParagraphNode, $createTextNode, $getRoot, CLEAR_HISTORY_COMMAND} from 'lexical';
import * as React from 'react';
import {useRef, useEffect} from 'react';

import {createWebsocketProvider} from './collaboration';
import {useSettings} from './context/SettingsContext';
import {useSharedHistoryContext} from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CharacterStylesPopupPlugin from './plugins/CharacterStylesPopupPlugin';
import ClickableLinkPlugin from './plugins/ClickableLinkPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin';
import HorizontalRulePlugin from './plugins/HorizontalRulePlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import PollPlugin from './plugins/PollPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import {useLexicalComposerContext} from "@lexical/react/src/LexicalComposerContext"

const skipCollaborationInit =
    window.parent != null && window.parent.frames.right === window;

let lastState

function prepopulatedRichText() {
    const root = $getRoot();
    if (root.getFirstChild() === null) {
        const heading = $createHeadingNode('h1');
        heading.append($createTextNode('Welcome to the playground'));
        root.append(heading);
        const quote = $createQuoteNode();
        quote.append(
            $createTextNode(
                `In case you were wondering what the black box at the bottom is – it's the debug view, showing the current state of editor. ` +
                `You can hide it by pressing on the settings control in the bottom-right of your screen and toggling the debug view setting.`,
            ),
        );
        root.append(quote);
        const paragraph = $createParagraphNode();
        paragraph.append(
            $createTextNode('The playground is a demo environment built with '),
            $createTextNode('@lexical/react').toggleFormat('code'),
            $createTextNode('.'),
            $createTextNode(' Try typing in '),
            $createTextNode('some text').toggleFormat('bold'),
            $createTextNode(' with '),
            $createTextNode('different').toggleFormat('italic'),
            $createTextNode(' formats.'),
        );
        root.append(paragraph);
        const paragraph2 = $createParagraphNode();
        paragraph2.append(
            $createTextNode(
                'Make sure to check out the various plugins in the toolbar. You can also use #hashtags or @-mentions too!',
            ),
        );
        root.append(paragraph2);
        const paragraph3 = $createParagraphNode();
        paragraph3.append(
            $createTextNode(`If you'd like to find out more about Lexical, you can:`),
        );
        root.append(paragraph3);
        const list = $createListNode('ul');
        list.append(
            $createListItemNode().append(
                $createTextNode(`Visit the `),
                $createLinkNode('https://lexical.dev/').append(
                    $createTextNode('Lexical website'),
                ),
                $createTextNode(` for documentation and more information.`),
            ),
            $createListItemNode().append(
                $createTextNode(`Check out the code on our `),
                $createLinkNode('https://github.com/facebook/lexical').append(
                    $createTextNode('GitHub repository'),
                ),
                $createTextNode(`.`),
            ),
            $createListItemNode().append(
                $createTextNode(`Join our `),
                $createLinkNode('https://discord.com/invite/KmG4wQnnD9').append(
                    $createTextNode('Discord Server'),
                ),
                $createTextNode(` and chat with the team.`),
            ),
        );
        root.append(list);
        const paragraph4 = $createParagraphNode();
        paragraph4.append(
            $createTextNode(
                `Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance :).`,
            ),
        );
        root.append(paragraph4);
    }
}

export default function Editor(): React$Node {
    const {historyState} = useSharedHistoryContext();
    const {
        settings: {
            isCollab,
            isAutocomplete,
            isCharLimit,
            isCharLimitUtf8,
            isRichText,
            showTreeView,
            emptyEditor,
        },
    } = useSettings();
    const text = isCollab
        ? 'Enter some collaborative rich text...'
        : isRichText
            ? 'Enter some rich text...'
            : 'Enter some plain text...';
    const placeholder = <Placeholder>{text}</Placeholder>;
    const scrollRef = useRef(null);

    const [editor, context] = useLexicalComposerContext()

    useEffect(() => {
        const json = {
            "editorState": {
                "_nodeMap": [["root", {
                    "__children": ["2", "5", "7", "9", "74", "76", "80", "82", "91", "93", "97", "99", "108", "110", "114", "116", "119", "121", "125", "127", "130", "132", "136", "138", "141", "143", "147", "149", "152", "154", "158", "160", "163", "165", "169", "171", "174"],
                    "__dir": "ltr",
                    "__format": 0,
                    "__indent": 0,
                    "__key": "root",
                    "__parent": null,
                    "__type": "root"
                }], ["2", {
                    "__type": "heading",
                    "__parent": "root",
                    "__key": "2",
                    "__children": ["3", "4"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__tag": "h1"
                }], ["3", {"__type": "linebreak", "__parent": "2", "__key": "3"}], ["4", {
                    "__type": "text",
                    "__parent": "2",
                    "__key": "4",
                    "__text": "Plugins",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["5", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "5",
                    "__children": ["6"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["6", {
                    "__type": "excalidraw",
                    "__parent": "5",
                    "__key": "6",
                    "__data": "[{\"id\":\"w7SeiXhoHMyJZSWHXwppF\",\"type\":\"rectangle\",\"x\":624,\"y\":165,\"width\":322.5,\"height\":211,\"angle\":0,\"strokeColor\":\"#000000\",\"backgroundColor\":\"transparent\",\"fillStyle\":\"hachure\",\"strokeWidth\":1,\"strokeStyle\":\"solid\",\"roughness\":1,\"opacity\":100,\"groupIds\":[],\"strokeSharpness\":\"sharp\",\"seed\":1912247677,\"version\":19,\"versionNonce\":1718841565,\"isDeleted\":false,\"boundElements\":null,\"updated\":1654046279404,\"link\":null}]"
                }], ["7", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "7",
                    "__children": ["8"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["8", {
                    "__type": "text",
                    "__parent": "7",
                    "__key": "8",
                    "__text": "React-based plugins are using Lexical editor instance from <LexicalComposer> context:",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["9", {
                    "__type": "code",
                    "__parent": "root",
                    "__key": "9",
                    "__children": ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__language": "javascript"
                }], ["10", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "10",
                    "__text": "<",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["11", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "11",
                    "__text": "LexicalComposer initialConfig",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["12", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "12",
                    "__text": "=",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["13", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "13",
                    "__text": "{",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "punctuation"
                }], ["14", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "14",
                    "__text": "initialConfig",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["15", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "15",
                    "__text": "}",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "punctuation"
                }], ["16", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "16",
                    "__text": ">",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["17", {"__type": "linebreak", "__parent": "9", "__key": "17"}], ["18", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "18",
                    "__text": "  ",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["19", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "19",
                    "__text": "<",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["20", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "20",
                    "__text": "LexicalPlainTextPlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["21", {"__type": "linebreak", "__parent": "9", "__key": "21"}], ["22", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "22",
                    "__text": "    contentEditable",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["23", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "23",
                    "__text": "=",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["24", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "24",
                    "__text": "{",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "punctuation"
                }], ["25", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "25",
                    "__text": "<",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["26", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "26",
                    "__text": "LexicalContentEditable ",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["27", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "27",
                    "__text": "/",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["28", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "28",
                    "__text": ">",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["29", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "29",
                    "__text": "}",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "punctuation"
                }], ["30", {"__type": "linebreak", "__parent": "9", "__key": "30"}], ["31", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "31",
                    "__text": "    placeholder",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["32", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "32",
                    "__text": "=",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["33", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "33",
                    "__text": "{",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "punctuation"
                }], ["34", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "34",
                    "__text": "<",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["35", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "35",
                    "__text": "div",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["36", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "36",
                    "__text": ">",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["37", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "37",
                    "__text": "Enter some text",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["38", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "38",
                    "__text": "...",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["39", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "39",
                    "__text": "<",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["40", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "40",
                    "__text": "/",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["41", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "41",
                    "__text": "div",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["42", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "42",
                    "__text": ">",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["43", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "43",
                    "__text": "}",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "punctuation"
                }], ["44", {"__type": "linebreak", "__parent": "9", "__key": "44"}], ["45", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "45",
                    "__text": "  ",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["46", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "46",
                    "__text": "/",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["47", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "47",
                    "__text": ">",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["48", {"__type": "linebreak", "__parent": "9", "__key": "48"}], ["49", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "49",
                    "__text": "  ",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["50", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "50",
                    "__text": "<",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["51", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "51",
                    "__text": "LexicalHistoryPlugin ",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["52", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "52",
                    "__text": "/",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["53", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "53",
                    "__text": ">",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["54", {"__type": "linebreak", "__parent": "9", "__key": "54"}], ["55", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "55",
                    "__text": "  ",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["56", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "56",
                    "__text": "<",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["57", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "57",
                    "__text": "LexicalOnChangePlugin onChange",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["58", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "58",
                    "__text": "=",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["59", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "59",
                    "__text": "{",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "punctuation"
                }], ["60", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "60",
                    "__text": "onChange",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["61", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "61",
                    "__text": "}",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "punctuation"
                }], ["62", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "62",
                    "__text": " ",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["63", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "63",
                    "__text": "/",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["64", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "64",
                    "__text": ">",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["65", {"__type": "linebreak", "__parent": "9", "__key": "65"}], ["66", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "66",
                    "__text": "  ",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["67", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "67",
                    "__text": "...",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["68", {"__type": "linebreak", "__parent": "9", "__key": "68"}], ["69", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "69",
                    "__text": "<",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["70", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "70",
                    "__text": "/",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["71", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "71",
                    "__text": "LexicalComposer",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["72", {
                    "__type": "code-highlight",
                    "__parent": "9",
                    "__key": "72",
                    "__text": ">",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0,
                    "__highlightType": "operator"
                }], ["73", {"__type": "linebreak", "__parent": "9", "__key": "73"}], ["74", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "74",
                    "__children": ["75"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["75", {"__type": "linebreak", "__parent": "74", "__key": "75"}], ["76", {
                    "__type": "heading",
                    "__parent": "root",
                    "__key": "76",
                    "__children": ["77", "78"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__tag": "h3"
                }], ["77", {
                    "__type": "text",
                    "__parent": "76",
                    "__key": "77",
                    "__text": "LexicalPlainTextPlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["78", {
                    "__type": "link",
                    "__parent": "76",
                    "__key": "78",
                    "__children": ["79"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": null,
                    "__url": "https://lexical.dev/docs/react/plugins#lexicalplaintextplugin"
                }], ["79", {
                    "__type": "text",
                    "__parent": "78",
                    "__key": "79",
                    "__text": "​",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["80", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "80",
                    "__children": ["81"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["81", {
                    "__type": "text",
                    "__parent": "80",
                    "__key": "81",
                    "__text": "React wrapper for @lexical/plain-text that adds major features for plain text editing, including typing, deletion and copy/pasting",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["82", {
                    "__type": "code",
                    "__parent": "root",
                    "__key": "82",
                    "__children": ["83", "84", "85", "86", "87", "88", "89", "90"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["83", {
                    "__type": "text",
                    "__parent": "82",
                    "__key": "83",
                    "__text": "<LexicalPlainTextPlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["84", {"__type": "linebreak", "__parent": "82", "__key": "84"}], ["85", {
                    "__type": "text",
                    "__parent": "82",
                    "__key": "85",
                    "__text": "  contentEditable={<LexicalContentEditable />}",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["86", {"__type": "linebreak", "__parent": "82", "__key": "86"}], ["87", {
                    "__type": "text",
                    "__parent": "82",
                    "__key": "87",
                    "__text": "  placeholder={<div>Enter some text...</div>}",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["88", {"__type": "linebreak", "__parent": "82", "__key": "88"}], ["89", {
                    "__type": "text",
                    "__parent": "82",
                    "__key": "89",
                    "__text": "/>",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["90", {"__type": "linebreak", "__parent": "82", "__key": "90"}], ["91", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "91",
                    "__children": ["92"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["92", {"__type": "linebreak", "__parent": "91", "__key": "92"}], ["93", {
                    "__type": "heading",
                    "__parent": "root",
                    "__key": "93",
                    "__children": ["94", "95"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__tag": "h3"
                }], ["94", {
                    "__type": "text",
                    "__parent": "93",
                    "__key": "94",
                    "__text": "LexicalRichTextPlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["95", {
                    "__type": "link",
                    "__parent": "93",
                    "__key": "95",
                    "__children": ["96"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": null,
                    "__url": "https://lexical.dev/docs/react/plugins#lexicalrichtextplugin"
                }], ["96", {
                    "__type": "text",
                    "__parent": "95",
                    "__key": "96",
                    "__text": "​",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["97", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "97",
                    "__children": ["98"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["98", {
                    "__type": "text",
                    "__parent": "97",
                    "__key": "98",
                    "__text": "React wrapper for @lexical/rich-text that adds major features for rich text editing, including typing, deletion, copy/pasting, indent/outdent and bold/italic/underline/strikethrough text formatting",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["99", {
                    "__type": "code",
                    "__parent": "root",
                    "__key": "99",
                    "__children": ["100", "101", "102", "103", "104", "105", "106", "107"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["100", {
                    "__type": "text",
                    "__parent": "99",
                    "__key": "100",
                    "__text": "<LexicalRichTextPlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["101", {"__type": "linebreak", "__parent": "99", "__key": "101"}], ["102", {
                    "__type": "text",
                    "__parent": "99",
                    "__key": "102",
                    "__text": "  contentEditable={<LexicalContentEditable />}",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["103", {"__type": "linebreak", "__parent": "99", "__key": "103"}], ["104", {
                    "__type": "text",
                    "__parent": "99",
                    "__key": "104",
                    "__text": "  placeholder={null}",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["105", {"__type": "linebreak", "__parent": "99", "__key": "105"}], ["106", {
                    "__type": "text",
                    "__parent": "99",
                    "__key": "106",
                    "__text": "/>",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["107", {"__type": "linebreak", "__parent": "99", "__key": "107"}], ["108", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "108",
                    "__children": ["109"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["109", {"__type": "linebreak", "__parent": "108", "__key": "109"}], ["110", {
                    "__type": "heading",
                    "__parent": "root",
                    "__key": "110",
                    "__children": ["111", "112"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__tag": "h3"
                }], ["111", {
                    "__type": "text",
                    "__parent": "110",
                    "__key": "111",
                    "__text": "LexicalOnChangePlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["112", {
                    "__type": "link",
                    "__parent": "110",
                    "__key": "112",
                    "__children": ["113"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": null,
                    "__url": "https://lexical.dev/docs/react/plugins#lexicalonchangeplugin"
                }], ["113", {
                    "__type": "text",
                    "__parent": "112",
                    "__key": "113",
                    "__text": "​",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["114", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "114",
                    "__children": ["115"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["115", {
                    "__type": "text",
                    "__parent": "114",
                    "__key": "115",
                    "__text": "Plugin that calls onChange whenever Lexical state is updated. Using ignoreInitialChange (true by default) and ignoreSelectionChange (false by default) can give more granular control over changes that are causing onChange call",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["116", {
                    "__type": "code",
                    "__parent": "root",
                    "__key": "116",
                    "__children": ["117", "118"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["117", {
                    "__type": "text",
                    "__parent": "116",
                    "__key": "117",
                    "__text": "<LexicalOnChangePlugin onChange={onChange} />",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["118", {"__type": "linebreak", "__parent": "116", "__key": "118"}], ["119", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "119",
                    "__children": ["120"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["120", {"__type": "linebreak", "__parent": "119", "__key": "120"}], ["121", {
                    "__type": "heading",
                    "__parent": "root",
                    "__key": "121",
                    "__children": ["122", "123"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__tag": "h3"
                }], ["122", {
                    "__type": "text",
                    "__parent": "121",
                    "__key": "122",
                    "__text": "LexicalHistoryPlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["123", {
                    "__type": "link",
                    "__parent": "121",
                    "__key": "123",
                    "__children": ["124"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": null,
                    "__url": "https://lexical.dev/docs/react/plugins#lexicalhistoryplugin"
                }], ["124", {
                    "__type": "text",
                    "__parent": "123",
                    "__key": "124",
                    "__text": "​",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["125", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "125",
                    "__children": ["126"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["126", {
                    "__type": "text",
                    "__parent": "125",
                    "__key": "126",
                    "__text": "React wrapper for @lexical/history that adds support for history stack management and undo / redo commands",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["127", {
                    "__type": "code",
                    "__parent": "root",
                    "__key": "127",
                    "__children": ["128", "129"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["128", {
                    "__type": "text",
                    "__parent": "127",
                    "__key": "128",
                    "__text": "<LexicalHistoryPlugin />",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["129", {"__type": "linebreak", "__parent": "127", "__key": "129"}], ["130", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "130",
                    "__children": ["131"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["131", {"__type": "linebreak", "__parent": "130", "__key": "131"}], ["132", {
                    "__type": "heading",
                    "__parent": "root",
                    "__key": "132",
                    "__children": ["133", "134"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__tag": "h3"
                }], ["133", {
                    "__type": "text",
                    "__parent": "132",
                    "__key": "133",
                    "__text": "LexicalLinkPlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["134", {
                    "__type": "link",
                    "__parent": "132",
                    "__key": "134",
                    "__children": ["135"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": null,
                    "__url": "https://lexical.dev/docs/react/plugins#lexicallinkplugin"
                }], ["135", {
                    "__type": "text",
                    "__parent": "134",
                    "__key": "135",
                    "__text": "​",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["136", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "136",
                    "__children": ["137"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["137", {
                    "__type": "text",
                    "__parent": "136",
                    "__key": "137",
                    "__text": "React wrapper for @lexical/link that adds support for links, including toggleLink command support that toggles link for selected text",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["138", {
                    "__type": "code",
                    "__parent": "root",
                    "__key": "138",
                    "__children": ["139", "140"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["139", {
                    "__type": "text",
                    "__parent": "138",
                    "__key": "139",
                    "__text": "<LexicalLinkPlugin />",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["140", {"__type": "linebreak", "__parent": "138", "__key": "140"}], ["141", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "141",
                    "__children": ["142"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["142", {"__type": "linebreak", "__parent": "141", "__key": "142"}], ["143", {
                    "__type": "heading",
                    "__parent": "root",
                    "__key": "143",
                    "__children": ["144", "145"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__tag": "h3"
                }], ["144", {
                    "__type": "text",
                    "__parent": "143",
                    "__key": "144",
                    "__text": "LexicalListPlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["145", {
                    "__type": "link",
                    "__parent": "143",
                    "__key": "145",
                    "__children": ["146"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": null,
                    "__url": "https://lexical.dev/docs/react/plugins#lexicallistplugin"
                }], ["146", {
                    "__type": "text",
                    "__parent": "145",
                    "__key": "146",
                    "__text": "​",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["147", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "147",
                    "__children": ["148"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["148", {
                    "__type": "text",
                    "__parent": "147",
                    "__key": "148",
                    "__text": "React wrapper for @lexical/list that adds support for lists (ordered and unordered)",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["149", {
                    "__type": "code",
                    "__parent": "root",
                    "__key": "149",
                    "__children": ["150", "151"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["150", {
                    "__type": "text",
                    "__parent": "149",
                    "__key": "150",
                    "__text": "<LexicalLinkPlugin />",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["151", {"__type": "linebreak", "__parent": "149", "__key": "151"}], ["152", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "152",
                    "__children": ["153"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["153", {"__type": "linebreak", "__parent": "152", "__key": "153"}], ["154", {
                    "__type": "heading",
                    "__parent": "root",
                    "__key": "154",
                    "__children": ["155", "156"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__tag": "h3"
                }], ["155", {
                    "__type": "text",
                    "__parent": "154",
                    "__key": "155",
                    "__text": "LexicalCheckListPlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["156", {
                    "__type": "link",
                    "__parent": "154",
                    "__key": "156",
                    "__children": ["157"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": null,
                    "__url": "https://lexical.dev/docs/react/plugins#lexicalchecklistplugin"
                }], ["157", {
                    "__type": "text",
                    "__parent": "156",
                    "__key": "157",
                    "__text": "​",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["158", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "158",
                    "__children": ["159"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["159", {
                    "__type": "text",
                    "__parent": "158",
                    "__key": "159",
                    "__text": "React wrapper for @lexical/list that adds support for check lists. Note that it requires some css to render check/uncheck marks. See PlaygroundEditorTheme.css for details.",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["160", {
                    "__type": "code",
                    "__parent": "root",
                    "__key": "160",
                    "__children": ["161", "162"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["161", {
                    "__type": "text",
                    "__parent": "160",
                    "__key": "161",
                    "__text": "<LexicalLinkPlugin />",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["162", {"__type": "linebreak", "__parent": "160", "__key": "162"}], ["163", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "163",
                    "__children": ["164"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["164", {"__type": "linebreak", "__parent": "163", "__key": "164"}], ["165", {
                    "__type": "heading",
                    "__parent": "root",
                    "__key": "165",
                    "__children": ["166", "167"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr",
                    "__tag": "h3"
                }], ["166", {
                    "__type": "text",
                    "__parent": "165",
                    "__key": "166",
                    "__text": "LexicalTablePlugin",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["167", {
                    "__type": "link",
                    "__parent": "165",
                    "__key": "167",
                    "__children": ["168"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": null,
                    "__url": "https://lexical.dev/docs/react/plugins#lexicaltableplugin"
                }], ["168", {
                    "__type": "text",
                    "__parent": "167",
                    "__key": "168",
                    "__text": "​",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["169", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "169",
                    "__children": ["170"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["170", {
                    "__type": "text",
                    "__parent": "169",
                    "__key": "170",
                    "__text": "React wrapper for @lexical/table that adds support for tables",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["171", {
                    "__type": "code",
                    "__parent": "root",
                    "__key": "171",
                    "__children": ["172", "173"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["172", {
                    "__type": "text",
                    "__parent": "171",
                    "__key": "172",
                    "__text": "<LexicalTablePlugin />",
                    "__format": 0,
                    "__style": "",
                    "__mode": 0,
                    "__detail": 0
                }], ["173", {"__type": "linebreak", "__parent": "171", "__key": "173"}], ["174", {
                    "__type": "paragraph",
                    "__parent": "root",
                    "__key": "174",
                    "__children": ["175", "176"],
                    "__format": 0,
                    "__indent": 0,
                    "__dir": "ltr"
                }], ["175", {"__type": "linebreak", "__parent": "174", "__key": "175"}], ["176", {
                    "__type": "linebreak",
                    "__parent": "174",
                    "__key": "176"
                }]],
                "_selection": {
                    "anchor": {"key": "8", "offset": 85, "type": "text"},
                    "focus": {"key": "8", "offset": 85, "type": "text"},
                    "type": "range"
                }
            }, "lastSaved": 1654095290939, "source": "Playground", "version": "0.2.3"
        };
        const editorState = editor.parseEditorState(
            JSON.stringify(json.editorState),
        );
        console.log(editorState);
        editor.setEditorState(editorState);
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND);
        editor.registerUpdateListener(({editorState}) => {
            // The latest EditorState can be found as `editorState`.
            // To read the contents of the EditorState, use the following API:
            console.log(editorState, '===========================================================================================================================')
            if (lastState) {
                console.error(lastState === editorState)
            }
            lastState = editorState
            editorState.read(() => {
                // Just like editor.update(), .read() expects a closure where you can use
                // the $ prefixed helper functions.
            });
        });
    }, [])

    return (
        <>
            {isRichText && <ToolbarPlugin/>}
            <div
                className={`editor-container ${showTreeView ? 'tree-view' : ''} ${
                    !isRichText ? 'plain-text' : ''
                }`}
                ref={scrollRef}>
                <AutoFocusPlugin/>
                <LexicalClearEditorPlugin/>
                <MentionsPlugin/>
                <EmojisPlugin/>
                <ExcalidrawPlugin/>
                <HashtagsPlugin/>
                <KeywordsPlugin/>
                <HorizontalRulePlugin/>
                <SpeechToTextPlugin/>
                <AutoLinkPlugin/>
                <CharacterStylesPopupPlugin/>
                <EquationsPlugin/>
                <AutoScrollPlugin scrollRef={scrollRef}/>
                {isRichText ? (
                    <>
                        {isCollab ? (
                            <CollaborationPlugin
                                id="main"
                                providerFactory={createWebsocketProvider}
                                shouldBootstrap={!skipCollaborationInit}
                            />
                        ) : (
                            <HistoryPlugin externalHistoryState={historyState}/>
                        )}
                        <RichTextPlugin
                            contentEditable={<ContentEditable/>}
                            placeholder={placeholder}
                            initialEditorState={
                                isCollab ? null : emptyEditor ? undefined : prepopulatedRichText
                            }
                        />
                        <LexicalMarkdownShortcutPlugin/>
                        <CodeHighlightPlugin/>
                        <ListPlugin/>
                        <ListMaxIndentLevelPlugin maxDepth={7}/>
                        <TablesPlugin/>
                        <TableCellActionMenuPlugin/>
                        <TableCellResizer/>
                        <ImagesPlugin/>
                        <LinkPlugin/>
                        <PollPlugin/>
                        <TwitterPlugin/>
                        <YouTubePlugin/>
                        <ClickableLinkPlugin/>
                    </>
                ) : (
                    <>
                        <PlainTextPlugin
                            contentEditable={<ContentEditable/>}
                            placeholder={placeholder}
                        />
                        <HistoryPlugin externalHistoryState={historyState}/>
                    </>
                )}
                {(isCharLimit || isCharLimitUtf8) && (
                    <CharacterLimitPlugin charset={isCharLimit ? 'UTF-16' : 'UTF-8'}/>
                )}
                {isAutocomplete && <AutocompletePlugin/>}
                <ActionsPlugin isRichText={isRichText}/>
            </div>
            {showTreeView && <TreeViewPlugin/>}
        </>
    );
}
