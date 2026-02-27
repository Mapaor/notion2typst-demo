
export type TokenType =
  | "comment"
  | "math"
  | "string"
  | "raw"
  | "number"
  | "keyword"
  | "builtin"
  | "heading"
  | "list"
  | "label"
  | "reference"
  | "emph"
  | "strong"
  | "operator"
  | "identifier"
  | "punct";

interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = [
  "let",
  "if",
  "else",
  "for",
  "while",
  "break",
  "continue",
  "return",
  "include",
  "import",
  "as",
  "in",
  "set",
  "show",
  "none",
  "auto",
  "true",
  "false",
];

const KEYWORD_RE = new RegExp(
  "\\b(" + KEYWORDS.map((k) => k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|") + ")\\b"
);

export function tokenizeTypst(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const push = (type: TokenType, value: string) => {
    if (!value) return;
    tokens.push({ type, value });
  };

  while (i < code.length) {
    const ch = code[i];
    const rest = code.slice(i);

    // Newlines preserved
    if (ch === "\n") {
      push("punct", "\n");
      i++;
      continue;
    }

    // Block comment /* ... */
    if (rest.startsWith("/*")) {
      const end = code.indexOf("*/", i + 2);
      const endPos = end === -1 ? code.length : end + 2;
      push("comment", code.slice(i, endPos));
      i = endPos;
      continue;
    }

    // Line comment //...
    if (rest.startsWith("//")) {
      const end = code.indexOf("\n", i + 2);
      const endPos = end === -1 ? code.length : end;
      push("comment", code.slice(i, endPos));
      i = endPos;
      continue;
    }

    // Math $...$ (non-greedy, handles inline and block alike)
    if (ch === "$") {
      let j = i + 1;
      let escaped = false;
      while (j < code.length) {
        if (!escaped && code[j] === "$") {
          j++;
          break;
        }
        escaped = !escaped && code[j] === "\\";
        j++;
      }
      push("math", code.slice(i, j));
      i = j;
      continue;
    }

    // String "..."
    if (ch === '"') {
      let j = i + 1;
      let escaped = false;
      while (j < code.length) {
        const cj = code[j];
        if (!escaped && cj === '"') {
          j++;
          break;
        }
        escaped = !escaped && cj === "\\";
        j++;
      }
      push("string", code.slice(i, j));
      i = j;
      continue;
    }

    // Raw text `...`
    if (ch === "`") {
      let j = i + 1;
      while (j < code.length && code[j] !== "`") j++;
      if (j < code.length) j++;
      push("raw", code.slice(i, j));
      i = j;
      continue;
    }

    // Heading at start of line: =, ==, ===
    if (
      (ch === "=") &&
      (i === 0 || code[i - 1] === "\n")
    ) {
      let j = i;
      while (code[j] === "=") j++;
      while (j < code.length && code[j] === " ") j++;
      // read until newline
      let k = j;
      while (k < code.length && code[k] !== "\n") k++;
      push("heading", code.slice(i, k));
      i = k;
      continue;
    }

    // List markers: -, +, / at line start
    if (
      (ch === "-" || ch === "+" || ch === "/") &&
      (i === 0 || code[i - 1] === "\n") &&
      (code[i + 1] === " " || code[i + 1] === "\t")
    ) {
      // just consume the marker, let rest be tokenized normally
      push("list", ch);
      i += 1;
      continue;
    }

    // Label <intro>
    if (ch === "<") {
      const end = code.indexOf(">", i + 1);
      if (end !== -1) {
        push("label", code.slice(i, end + 1));
        i = end + 1;
        continue;
      }
    }

    // Reference @intro
    if (ch === "@") {
      const match = rest.match(/^@[A-Za-z_][\w\-]*/);
      if (match) {
        push("reference", match[0]);
        i += match[0].length;
        continue;
      }
    }

    // Strong *strong*
    if (ch === "*" && /(^|\s)/.test(code[i - 1] ?? " ")) {
      const end = code.indexOf("*", i + 1);
      if (end !== -1) {
        push("strong", code.slice(i, end + 1));
        i = end + 1;
        continue;
      }
    }

    // Emphasis _emph_
    if (ch === "_" && /(^|\s)/.test(code[i - 1] ?? " ")) {
      const end = code.indexOf("_", i + 1);
      if (end !== -1) {
        push("emph", code.slice(i, end + 1));
        i = end + 1;
        continue;
      }
    }

    // Numbers, including units (pt, mm, cm, em, fr, %, deg, rad)
    const numMatch = rest.match(
      /^((\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?)\s*(pt|mm|cm|in|em|fr|%|deg|rad)?/i
    );
    if (numMatch && numMatch[0].trim().length > 0) {
      push("number", numMatch[0]);
      i += numMatch[0].length;
      continue;
    }

    // Identifiers (including kebab-case)
    const idMatch = rest.match(/^[A-Za-z_][\w-]*/u);
    if (idMatch) {
      const text = idMatch[0];
      if (KEYWORD_RE.test(text)) {
        push("keyword", text);
      } else {
        push("identifier", text);
      }
      i += text.length;
      continue;
    }

    // Operators and punctuation
    const opMatch = rest.match(/^(\+\+|--|==|!=|<=|>=|&&|\|\||[+\-*/%=&|^<>.:,#()\[\]{}\\])/);
    if (opMatch) {
      push("operator", opMatch[0]);
      i += opMatch[0].length;
      continue;
    }

    // Fallback: single character
    push("punct", ch);
    i++;
  }

  return tokens;
}