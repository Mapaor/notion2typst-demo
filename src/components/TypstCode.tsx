import React, { useState } from 'react';
import { tokenizeTypst, TokenType } from '../lib/utils/typstTokenizer';

interface TexCodeProps {
  code: string;
}

export default function TexCode({ code }: TexCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative bg-gray-900 rounded-lg shadow p-4 mt-2 h-64">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 text-gray-300 hover:text-white transition z-10"
        title="Copy to clipboard"
        aria-label="Copy code"
      >
        {copied ? (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
        )}
      </button>
      <pre className="overflow-auto text-sm leading-relaxed mt-2 h-full pr-12">
        <code className="language-typst text-green-200">
          {highlightTypst(code)}
        </code>
      </pre>
    </div>
  );
}

// Typst highlighting
export function highlightTypst(code: string): React.ReactNode {
  if (!code) return null;
  const tokens = tokenizeTypst(code);

  const classForType: Record<TokenType, string> = {
    comment: "text-gray-500 italic",
    math: "text-emerald-300",
    string: "text-amber-300",
    raw: "text-amber-200",
    number: "text-purple-300",
    keyword: "text-sky-300",
    builtin: "text-sky-200",
    heading: "text-pink-300 font-semibold",
    list: "text-pink-200",
    label: "text-rose-300",
    reference: "text-rose-300",
    emph: "italic text-zinc-100",
    strong: "font-semibold text-zinc-100",
    operator: "text-zinc-300",
    identifier: "text-zinc-100",
    punct: "text-zinc-100",
  };

  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.value === "\n") {
          return <br key={i} />;
        }
        const cls = classForType[tok.type];
        if (!cls) return <span key={i}>{tok.value}</span>;
        return (
          <span key={i} className={cls}>
            {tok.value}
          </span>
        );
      })}
    </>
  );
}

