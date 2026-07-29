import type { Schema } from 'hast-util-sanitize'
import type { Processor } from 'unified'
import type { ViewerProps } from './types'
import { defaultSchema } from 'hast-util-sanitize'
import * as rehypeRawModule from 'rehype-raw'
import * as rehypeSanitizeModule from 'rehype-sanitize'
import * as rehypeStringifyModule from 'rehype-stringify'
import * as remarkParseModule from 'remark-parse'
import * as remarkRehypeModule from 'remark-rehype'
import { unified } from 'unified'

const schemaStr = JSON.stringify(defaultSchema)

function resolveModuleDefault<T>(module: T): T extends { default: infer U } ? U : T {
  const candidate = module as T & {
    default?: unknown
  }

  if (typeof candidate.default === 'function') {
    return candidate.default as T extends { default: infer U } ? U : T
  }

  if (
    candidate.default &&
    typeof (candidate.default as { default?: unknown }).default === 'function'
  ) {
    return (candidate.default as { default: T extends { default: infer U } ? U : T }).default
  }

  return module as T extends { default: infer U } ? U : T
}

const remarkParse = resolveModuleDefault(remarkParseModule)
const remarkRehype = resolveModuleDefault(remarkRehypeModule)
const rehypeRaw = resolveModuleDefault(rehypeRawModule)
const rehypeSanitize = resolveModuleDefault(rehypeSanitizeModule)
const rehypeStringify = resolveModuleDefault(rehypeStringifyModule)

/**
 * Get unified processor with ByteMD plugins
 */
export function getProcessor({
  sanitize,
  plugins,
  remarkRehype: remarkRehypeOptions = {},
}: Omit<ViewerProps, 'value'>): Processor {
  let processor: Processor = unified().use(remarkParse)

  plugins?.forEach(({ remark }) => {
    if (remark) processor = remark(processor)
  })
  processor = processor
    .use(remarkRehype, { allowDangerousHtml: true, ...remarkRehypeOptions })
    .use(rehypeRaw)

  let schema = JSON.parse(schemaStr) as Schema
  schema.attributes!['*'].push('className') // Allow class names by default

  if (typeof sanitize === 'function') {
    schema = sanitize(schema)
  }

  processor = processor.use(rehypeSanitize, schema)

  plugins?.forEach(({ rehype }) => {
    if (rehype) processor = rehype(processor)
  })

  processor.use(rehypeStringify as any)

  // `rehype-stringify@10` is designed for the newer unified stack.
  // In this migration window we bind it explicitly to ensure the compiler
  // is attached even before the rest of the unified chain is upgraded.
  ;(rehypeStringify as unknown as (this: Processor, ...args: any[]) => void).call(processor)
  ;(
    processor as Processor & {
      compiler?: unknown
      Compiler?: unknown
    }
  ).Compiler = (
    processor as Processor & {
      compiler?: unknown
    }
  ).compiler as any

  return processor
}
