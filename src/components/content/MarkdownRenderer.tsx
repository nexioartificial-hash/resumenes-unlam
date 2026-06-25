'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import Figure from './figures/Figure'

interface Props {
  children: string
  /** Convierte saltos de línea simples en <br> (como hacía ModuleContent). */
  breaks?: boolean
}

const FIGURE_RE = /language-figure-([\w-]+)/

/**
 * Renderiza markdown (GFM) y, además, reemplaza los bloques de código con
 * info-string `figure-<nombre>` por su figura SVG correspondiente.
 * El contenido ASCII dentro del bloque queda como fallback (lo ignora este
 * renderer, pero sirve si el bloque se muestra con un renderer sin soporte).
 */
export default function MarkdownRenderer({ children, breaks = false }: Props) {
  const components: Components = {
    pre({ children }) {
      // Quitamos el wrapper <pre>: las figuras manejan su propio marco y el
      // código normal se re-envuelve en `code` más abajo.
      return <>{children}</>
    },
    code({ className, children, ...props }) {
      const fig = FIGURE_RE.exec(className ?? '')
      if (fig) {
        return <Figure name={fig[1]} />
      }
      // Bloque de código normal (con lenguaje) → re-envolver en <pre>
      if (className?.startsWith('language-')) {
        return (
          <pre>
            <code className={className} {...props}>{children}</code>
          </pre>
        )
      }
      // Código inline
      return <code className={className} {...props}>{children}</code>
    },
  }

  return (
    <ReactMarkdown
      remarkPlugins={breaks ? [remarkGfm, remarkBreaks] : [remarkGfm]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  )
}
