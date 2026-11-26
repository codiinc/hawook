'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const components: Components = {
  h1: ({ children }) => (
    <h2 className="font-serif text-2xl font-medium text-gray-900 mt-8 mb-3 first:mt-0">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif text-xl font-medium text-gray-900 mt-7 mb-3 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-lg font-medium text-gray-900 mt-5 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 leading-relaxed mb-4 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-700">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 space-y-1 pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 space-y-1 pl-4 list-decimal">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-700 leading-relaxed flex gap-2">
      <span className="text-teal mt-1 shrink-0">—</span>
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-teal pl-4 italic text-gray-600 my-4">{children}</blockquote>
  ),
  hr: () => <hr className="border-gray-200 my-6" />,
  a: ({ href, children }) => (
    <a href={href} className="text-teal underline hover:text-teal-dark transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-gray-200">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-900 border border-gray-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-gray-700 border border-gray-200">{children}</td>
  ),
}

type Props = {
  content: string
  className?: string
}

export default function MarkdownContent({ content, className = '' }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
    </div>
  )
}
