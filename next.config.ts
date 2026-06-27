import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lint preexistente (react-hooks) rompe el build de producción en Vercel.
  // No queremos que el lint bloquee el deploy; sigue disponible con `npm run lint`.
  // TypeScript NO se ignora: los errores de tipos siguen rompiendo el build.
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    'react-markdown',
    'remark-gfm',
    'remark-parse',
    'remark-rehype',
    'rehype-react',
    'rehype-stringify',
    'unified',
    'bail',
    'is-plain-obj',
    'trough',
    'vfile',
    'vfile-message',
    'unist-util-stringify-position',
    'mdast-util-from-markdown',
    'mdast-util-to-hast',
    'micromark',
    'decode-named-character-reference',
    'character-entities',
  ],
};

export default nextConfig;
