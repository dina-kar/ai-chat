'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useTheme } from 'next-themes';
import { CopyIcon } from './icons';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  // Extract language from className (format: language-xxx)
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const codeString = String(children).replace(/\n$/, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    toast.success('Code copied to clipboard!');
  };

  if (!inline && mounted) {
    return (
      <div className="not-prose flex flex-col relative group">
        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-xl border border-b-0 border-border">
          <span className="text-xs text-muted-foreground font-medium">
            {language ? language.toUpperCase() : 'CODE'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={copyToClipboard}
          >
            <CopyIcon size={12} />
          </Button>
        </div>
        <SyntaxHighlighter
          language={language || 'text'}
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 12px 12px',
            border: '1px solid hsl(var(--border))',
            borderTop: 'none',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          codeTagProps={{
            style: {
              fontSize: '14px',
              fontFamily: 'var(--font-geist-mono), Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            },
          }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  } else if (!inline && !mounted) {
    // Fallback for SSR/before hydration
    return (
      <div className="not-prose flex flex-col">
        <pre
          className="text-sm w-full overflow-x-auto bg-card p-4 border border-border rounded-xl text-card-foreground"
        >
          <code className="whitespace-pre-wrap break-words">{children}</code>
        </pre>
      </div>
    );
  } else {
    // Inline code
    return (
      <code
        className={`${className} text-sm bg-muted py-0.5 px-1 rounded-md text-muted-foreground font-mono`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
