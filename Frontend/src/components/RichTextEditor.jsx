import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Quote, Heading1, Heading2, Loader2, Code, Type } from 'lucide-react';
import { blogApi } from '../api/blogs';
import useThemeStore from '../store/useThemeStore';

// --- Toolbar Button Component ---
const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => {
    const { isDarkMode } = useThemeStore();

    const base = 'p-1.5 rounded transition-colors flex items-center justify-center';
    const active = isDarkMode ? 'bg-white text-black' : 'bg-black text-white';
    const inactive = isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black';

    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                onClick && onClick();
            }}
            disabled={disabled}
            title={title}
            className={`${base} ${isActive ? active : inactive} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
};

// --- Main Editor Component ---
const RichTextEditor = ({ content = '', onChange = () => {} }) => {
    const { isDarkMode } = useThemeStore();
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeFormats, setActiveFormats] = useState({});
    const savedRange = useRef(null);

    // Initialize content and default paragraph separator
    useEffect(() => {
        if (editorRef.current && content !== editorRef.current.innerHTML) {
            if (!editorRef.current.innerHTML && content) {
                editorRef.current.innerHTML = content;
            }
        }
        // Default paragraph separator to <p>
        try {
            document.execCommand('defaultParagraphSeparator', false, 'p');
        } catch (e) {
            // some browsers may ignore; safe to continue
        }
        // run an initial format check
        setTimeout(checkFormats, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            checkFormats();
        }
    };

    const checkFormats = () => {
        // queryCommandValue may return block names like "h2", "blockquote", etc.
        const block = (document.queryCommandValue && document.queryCommandValue('formatBlock')) || '';
        const formats = {
            bold: !!document.queryCommandState && document.queryCommandState('bold'),
            italic: !!document.queryCommandState && document.queryCommandState('italic'),
            underline: !!document.queryCommandState && document.queryCommandState('underline'),
            strike: !!document.queryCommandState && document.queryCommandState('strikethrough'),
            unorderedList: !!document.queryCommandState && document.queryCommandState('insertUnorderedList'),
            orderedList: !!document.queryCommandState && document.queryCommandState('insertOrderedList'),
            h2: block && block.toLowerCase() === 'h2',
            h3: block && block.toLowerCase() === 'h3',
            blockquote: block && block.toLowerCase() === 'blockquote',
            pre: block && block.toLowerCase() === 'pre',
        };
        setActiveFormats(formats);
    };

    const execCmd = (command, value = null) => {
        try {
            document.execCommand(command, false, value);
        } catch (e) {
            console.error('execCommand error', e);
        }
        editorRef.current?.focus();
        setTimeout(checkFormats, 0);
    };

    // Toggle block (blockquote / pre) - Option A wants toggleable blocks
    const toggleBlock = (tagName) => {
        const current = (document.queryCommandValue && document.queryCommandValue('formatBlock')) || '';
        if (current && current.toLowerCase() === tagName.toLowerCase()) {
            execCmd('formatBlock', 'p'); // toggle off -> normal paragraph
        } else {
            execCmd('formatBlock', tagName);
        }
    };

    // Helper: determine whether caret is effectively at the end of a block
    const isCaretAtEndOf = (parentBlock, range) => {
        if (!parentBlock || !range) return false;
        try {
            const r = range.cloneRange();
            // start at caret
            r.setStart(range.endContainer, range.endOffset);
            // end after the parent block
            r.setEndAfter(parentBlock);
            const trailing = r.toString();
            return trailing.trim() === '';
        } catch (e) {
            return false;
        }
    };

    // Smart Enter Key Logic (Option A) - Medium-style
    const handleKeyDown = (e) => {
        if (e.key !== 'Enter') return;

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        // identify common ancestor node (text node -> parent)
        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentNode;
        const parentBlock = node.closest && node.closest('blockquote, pre');

        // Allow Shift+Enter to create soft breaks everywhere
        if (e.shiftKey) {
            return;
        }

        if (parentBlock) {
            // If the caret is in a code block (<pre>) and not at the end, let it insert a newline
            if (parentBlock.tagName === 'PRE') {
                const atEnd = isCaretAtEndOf(parentBlock, range);
                // If caret at end or current line is empty, exit; otherwise do nothing (allow newline)
                const currentLineText = range.startContainer.textContent || '';
                if (currentLineText.trim() === '' || atEnd) {
                    e.preventDefault();
                    // Insert paragraph after the pre block and move caret there
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    parentBlock.insertAdjacentElement('afterend', p);
                    // Move caret
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.setEnd(p, 0);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    handleInput();
                    return;
                } else {
                    // allow newline inside pre (normal code behavior)
                    return;
                }
            }

            // For blockquote (and other block tags matched), exit when:
            //  - caret at end of parent block
            //  - OR current line is empty (user pressed Enter on empty line)
            const isAtEnd = isCaretAtEndOf(parentBlock, range);
            const currentText = (range.startContainer && range.startContainer.textContent) || '';
            if (currentText.trim() === '' || isAtEnd) {
                e.preventDefault();

                const p = document.createElement('p');
                p.innerHTML = '<br>';

                parentBlock.insertAdjacentElement('afterend', p);

                // Move caret to new paragraph
                const newRange = document.createRange();
                newRange.setStart(p, 0);
                newRange.setEnd(p, 0);
                selection.removeAllRanges();
                selection.addRange(newRange);

                // Remove possible leftover empty nodes inside the block (if caret was on an empty placeholder)
                // Only remove immediate empty text nodes that are direct children
                try {
                    // If the node we were editing is an empty text node's parent and it's empty, remove it
                    if (range.startContainer.nodeType === 3 && range.startContainer.textContent.trim() === '') {
                        const parent = range.startContainer.parentNode;
                        if (parent && parent !== parentBlock && parent.textContent.trim() === '') {
                            parent.remove();
                        }
                    }
                } catch (err) {
                    // ignore cleanup errors
                }

                handleInput();
                return;
            }
        }
    };

    // Capture cursor position before file dialog opens
    const triggerImageUpload = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRange.current = selection.getRangeAt(0).cloneRange();
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await blogApi.uploadImage(file);
            if (url) {
                editorRef.current?.focus();

                // Restore selection
                if (savedRange.current) {
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(savedRange.current);
                }

                const imgHtml = `<img src="${url}" alt="Blog Image" style="max-width: 100%; border-radius: 8px; margin: 10px 0;" /><p><br></p>`;
                execCmd('insertHTML', imgHtml);
                handleInput();
            }
        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleLink = () => {
        const url = prompt('Enter URL:');
        if (url) execCmd('createLink', url);
    };

    // Theme Styles
    const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const toolbarBg = isDarkMode ? 'bg-[#121212] border-gray-700' : 'bg-white border-gray-200';
    const editorBg = isDarkMode ? 'bg-[#1e1e1e] text-gray-200' : 'bg-white text-gray-800';

    return (
        <div className={`rounded-xl overflow-hidden border shadow-sm flex flex-col ${borderColor}`}>
            {/* Toolbar */}
            <div className={`flex flex-wrap items-center gap-1 p-2 border-b sticky top-0 z-10 ${toolbarBg}`}>
                <ToolbarButton onClick={() => execCmd('formatBlock', 'H2')} isActive={activeFormats.h2} title="Heading 2">
                    <Heading1 size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCmd('formatBlock', 'H3')} isActive={activeFormats.h3} title="Heading 3">
                    <Heading2 size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCmd('formatBlock', 'p')} title="Normal Text">
                    <Type size={18} />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton onClick={() => execCmd('bold')} isActive={activeFormats.bold} title="Bold">
                    <Bold size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCmd('italic')} isActive={activeFormats.italic} title="Italic">
                    <Italic size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCmd('underline')} isActive={activeFormats.underline} title="Underline">
                    <Underline size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCmd('strikethrough')} isActive={activeFormats.strike} title="Strikethrough">
                    <Strikethrough size={18} />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton onClick={() => execCmd('insertUnorderedList')} isActive={activeFormats.unorderedList} title="Bullet List">
                    <List size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCmd('insertOrderedList')} isActive={activeFormats.orderedList} title="Ordered List">
                    <ListOrdered size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => toggleBlock('blockquote')} isActive={activeFormats.blockquote} title="Quote">
                    <Quote size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => toggleBlock('pre')} isActive={activeFormats.pre} title="Code Block">
                    <Code size={18} />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton onClick={handleLink} title="Link">
                    <LinkIcon size={18} />
                </ToolbarButton>

                {/* Image Button */}
                <button
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        triggerImageUpload();
                    }}
                    disabled={isUploading}
                    className={`p-1.5 rounded transition-colors flex items-center justify-center ${
                        isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                    title="Insert Image"
                >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            {/* Content Editable Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyUp={checkFormats}
                onMouseUp={checkFormats}
                onKeyDown={handleKeyDown}
                className={`flex-1 p-6 min-h-[400px] focus:outline-none prose max-w-none ${editorBg} ${isDarkMode ? 'prose-invert' : ''}`}
                style={{ minHeight: '400px', overflowY: 'auto' }}
                suppressContentEditableWarning
            />

            {/* Styles */}
            <style>{`
        .prose img {
          border-radius: 0.5rem;
          max-width: 100%;
          margin: 1rem 0;
          border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
          display: block;
        }
        .prose blockquote {
          border-left: 4px solid #ff642f;
          background: ${isDarkMode ? '#2d2d2d' : '#f9fafb'};
          padding: 0.5rem 1rem;
          font-style: italic;
          margin: 1rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .prose pre {
          background: ${isDarkMode ? '#121212' : '#1f2937'};
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: monospace;
          margin: 1rem 0;
          white-space: pre-wrap;
        }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
      `}</style>
        </div>
    );
};

export default RichTextEditor;
