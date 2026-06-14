// src/components/subject/KnowledgeMap.tsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactFlow, {
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'

import type { KnowledgeNode, KnowledgeEdge } from '@/data/knowledge-maps/index'

// ── Colores de mastery ────────────────────────────────────────────────────────

function getMasteryColor(mastery: number | undefined): string {
  if (mastery === undefined) return '#9E9E9E'
  if (mastery >= 0.70)       return '#0F3F26'
  if (mastery >= 0.40)       return '#F5D63E'
  return '#C8332A'
}

function getMasteryTextColor(mastery: number | undefined): string {
  if (mastery !== undefined && mastery >= 0.40 && mastery < 0.70) return '#0A0A0A'
  return '#fff'
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ModuleNodeData = {
  label:      string
  num:        number
  mastery?:   number
  expanded:   boolean
  highlighted: boolean
  onToggle:   () => void
}

type ChildNodeData = {
  label:       string
  nodeType:    'author' | 'concept'
  description: string
  module_id:   string
  moduleLabel: string
  highlighted: boolean
  onSelect:    () => void
}

// ── Nodo módulo ───────────────────────────────────────────────────────────────

function ModuleNode({ data }: NodeProps<ModuleNodeData>) {
  const bg   = getMasteryColor(data.mastery)
  const text = getMasteryTextColor(data.mastery)
  const pct  = data.mastery !== undefined ? `${Math.round(data.mastery * 100)}%` : '—'

  return (
    <div
      onClick={data.onToggle}
      style={{
        background:   bg,
        color:        text,
        borderRadius: '12px',
        padding:      '10px 16px',
        minWidth:     '170px',
        cursor:       'pointer',
        userSelect:   'none',
        border:       data.highlighted
          ? '2.5px solid #F5D63E'
          : `2px solid ${bg === '#9E9E9E' ? '#ccc' : bg}`,
        boxShadow:    data.highlighted
          ? '0 0 0 3px rgba(245,214,62,0.35), 0 2px 8px rgba(0,0,0,0.15)'
          : '0 2px 8px rgba(0,0,0,0.15)',
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        transition:   'box-shadow 0.2s',
      }}
    >
      <div style={{ fontWeight: 800, fontSize: '20px', opacity: 0.7, lineHeight: 1 }}>
        {data.num}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '0.02em' }}>
          {data.label}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '2px' }}>
          {pct} · {data.expanded ? '▾ colapsar' : '▸ expandir'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0 }} />
    </div>
  )
}

// ── Nodo hijo ─────────────────────────────────────────────────────────────────

function ChildNode({ data }: NodeProps<ChildNodeData>) {
  const icon   = data.nodeType === 'author' ? '👤' : '💡'
  const border = data.highlighted ? '2px solid #F5D63E' : '1.5px solid #e0e0e0'
  const shadow = data.highlighted
    ? '0 0 0 3px rgba(245,214,62,0.35), 0 1px 4px rgba(0,0,0,0.08)'
    : '0 1px 4px rgba(0,0,0,0.08)'

  return (
    <div
      onClick={data.onSelect}
      style={{
        background:   '#fff',
        borderRadius: '8px',
        padding:      '7px 12px',
        minWidth:     '130px',
        maxWidth:     '170px',
        cursor:       'pointer',
        userSelect:   'none',
        border,
        boxShadow:    shadow,
        display:      'flex',
        alignItems:   'center',
        gap:          '6px',
        fontSize:     '12px',
        color:        '#0A0A0A',
        transition:   'box-shadow 0.2s',
      }}
    >
      <span style={{ fontSize: '13px', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontWeight: 600, lineHeight: 1.3 }}>{data.label}</span>
      <Handle type="target" position={Position.Top}    style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left}   style={{ opacity: 0 }} id="left" />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0 }} id="right" />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0 }} id="left-t" />
      <Handle type="target" position={Position.Right}  style={{ opacity: 0 }} id="right-t" />
    </div>
  )
}

const nodeTypes = { moduleNode: ModuleNode, childNode: ChildNode }

// ── Panel lateral ─────────────────────────────────────────────────────────────

type PanelData = {
  label:       string
  description: string
  module_id:   string
  moduleLabel: string
  nodeType:    'author' | 'concept'
}

function SidePanel({ data, slug, onClose }: { data: PanelData; slug: string; onClose: () => void }) {
  const router = useRouter()

  return (
    <div style={{
      position:      'absolute',
      top:           '16px',
      right:         '16px',
      width:         '300px',
      background:    '#fff',
      borderRadius:  '16px',
      padding:       '20px',
      boxShadow:     '0 4px 24px rgba(0,0,0,0.14)',
      border:        '1px solid rgba(10,10,10,0.08)',
      zIndex:        10,
      display:       'flex',
      flexDirection: 'column',
      gap:           '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            {data.nodeType === 'author' ? '👤 Autor' : '💡 Concepto'} · {data.moduleLabel}
          </div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#0A0A0A', lineHeight: 1.3 }}>
            {data.label}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E', fontSize: '20px', padding: '0', lineHeight: 1, flexShrink: 0 }}
        >
          ×
        </button>
      </div>
      <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.65', margin: 0 }}>
        {data.description}
      </p>
      <button
        onClick={() => router.push(`/dashboard/${slug}/modulos/${data.module_id}`)}
        style={{
          background:    '#0F3F26',
          color:         '#F5F7E9',
          border:        'none',
          borderRadius:  '8px',
          padding:       '9px 16px',
          fontSize:      '12px',
          fontWeight:    700,
          letterSpacing: '0.06em',
          cursor:        'pointer',
          width:         '100%',
        }}
      >
        IR AL MÓDULO →
      </button>
    </div>
  )
}

// ── Componente interno (necesita ReactFlowProvider para useReactFlow) ─────────

export interface KnowledgeMapProps {
  mastery: Record<string, number>
  slug:    string
  nodes:   KnowledgeNode[]
  edges:   KnowledgeEdge[]
}

function KnowledgeMapInner({ mastery, slug, nodes: MAP_NODES, edges: MAP_EDGES }: KnowledgeMapProps) {
  const { fitView } = useReactFlow()

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [selectedPanel,   setSelectedPanel]   = useState<PanelData | null>(null)
  const [searchQuery,     setSearchQuery]      = useState('')

  const masteryRef = useRef(mastery)
  useEffect(() => { masteryRef.current = mastery }, [mastery])

  // IDs de nodos que coinciden con la búsqueda (memoizado: ref estable entre renders)
  const matchedIds = useMemo(() =>
    searchQuery.trim().length >= 2
      ? new Set(
          MAP_NODES
            .filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(n => n.id)
        )
      : new Set<string>(),
    [searchQuery, MAP_NODES]
  )

  const buildNodes = useCallback(
    (expanded: Set<string>, matched: Set<string>): Node[] => {
      const moduleNodes = MAP_NODES.filter(n => n.type === 'module')
      return MAP_NODES.map(fn => {
        const isModule = fn.type === 'module'
        const isHidden = !isModule && !expanded.has(fn.parent ?? '')

        if (isModule) {
          const moduleIdx = moduleNodes.indexOf(fn)
          return {
            id:        fn.id,
            type:      'moduleNode',
            position:  { x: fn.x, y: fn.y },
            hidden:    false,
            draggable: true,
            data: {
              label:       fn.label,
              num:         moduleIdx + 1,
              mastery:     masteryRef.current[fn.module_id ?? ''],
              expanded:    expanded.has(fn.id),
              highlighted: matched.size > 0 && matched.has(fn.id),
              onToggle: () => {
                setExpandedModules(prev => {
                  const next = new Set(prev)
                  if (next.has(fn.id)) next.delete(fn.id)
                  else                 next.add(fn.id)
                  return next
                })
                setSelectedPanel(null)
              },
            } as ModuleNodeData,
          }
        }

        const parentMod = MAP_NODES.find(n => n.id === fn.parent)
        return {
          id:        fn.id,
          type:      'childNode',
          position:  { x: fn.x, y: fn.y },
          hidden:    isHidden,
          draggable: true,
          data: {
            label:       fn.label,
            nodeType:    fn.type as 'author' | 'concept',
            description: fn.description,
            module_id:   fn.module_id ?? '',
            moduleLabel: parentMod?.label ?? '',
            highlighted: matched.size > 0 && matched.has(fn.id),
            onSelect: () => setSelectedPanel({
              label:       fn.label,
              description: fn.description,
              module_id:   fn.module_id ?? '',
              moduleLabel: parentMod?.label ?? '',
              nodeType:    fn.type as 'author' | 'concept',
            }),
          } as ChildNodeData,
        }
      })
    },
    [MAP_NODES]
  )

  const buildEdges = useCallback((expanded: Set<string>): Edge[] => {
    return MAP_EDGES.map(fe => {
      const isHierarchy = fe.type === 'hierarchy'

      if (isHierarchy) {
        return {
          id:     fe.id,
          source: fe.source,
          target: fe.target,
          hidden: !expanded.has(fe.source),
          type:   'smoothstep',
          style:  { stroke: '#d0d0d0', strokeWidth: 1.5 },
        }
      }

      const srcFn = MAP_NODES.find(n => n.id === fe.source)
      const tgtFn = MAP_NODES.find(n => n.id === fe.target)
      const srcHidden = srcFn?.parent ? !expanded.has(srcFn.parent) : false
      const tgtHidden = tgtFn?.parent ? !expanded.has(tgtFn.parent) : false

      return {
        id:       fe.id,
        source:   fe.source,
        target:   fe.target,
        hidden:   srcHidden || tgtHidden,
        type:     'smoothstep',
        animated: true,
        style:    { stroke: '#0F3F26', strokeWidth: 1.2, strokeDasharray: '5,4' },
      }
    })
  }, [MAP_NODES, MAP_EDGES])

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes(expandedModules, matchedIds))
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(expandedModules))

  useEffect(() => {
    setNodes(buildNodes(expandedModules, matchedIds))
    setEdges(buildEdges(expandedModules))
  }, [expandedModules, matchedIds, buildNodes, buildEdges, setNodes, setEdges])

  // Cuando hay resultados de búsqueda, auto-expandir el módulo padre y hacer fitView
  useEffect(() => {
    if (matchedIds.size === 0) return
    const parentsToExpand = new Set<string>()
    for (const id of matchedIds) {
      const node = MAP_NODES.find(n => n.id === id)
      if (node?.parent) parentsToExpand.add(node.parent)
    }
    if (parentsToExpand.size > 0) {
      setExpandedModules(prev => {
        const next = new Set(prev)
        parentsToExpand.forEach(p => next.add(p))
        return next
      })
      setTimeout(() => {
        fitView({ nodes: [...matchedIds].map(id => ({ id })), padding: 0.4, duration: 500 })
      }, 100)
    }
  }, [searchQuery, fitView]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stats de mastery
  const moduleNodes = MAP_NODES.filter(n => n.type === 'module')
  const dominated   = moduleNodes.filter(n => (mastery[n.module_id ?? ''] ?? 0) >= 0.7).length
  const inProgress  = moduleNodes.filter(n => { const m = mastery[n.module_id ?? '']; return m !== undefined && m >= 0.4 && m < 0.7 }).length
  const childCount  = MAP_NODES.filter(n => n.type !== 'module').length

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Barra de búsqueda */}
      <div style={{
        position:   'absolute',
        top:        '12px',
        left:       '50%',
        transform:  'translateX(-50%)',
        zIndex:     10,
        display:    'flex',
        alignItems: 'center',
        gap:        '8px',
      }}>
        <div style={{
          background:   '#fff',
          borderRadius: '10px',
          padding:      '6px 12px',
          boxShadow:    '0 2px 10px rgba(0,0,0,0.12)',
          border:       '1px solid #e0e0e0',
          display:      'flex',
          alignItems:   'center',
          gap:          '8px',
        }}>
          <span style={{ fontSize: '13px', color: '#9E9E9E' }}>🔍</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar autor o concepto..."
            style={{
              border:     'none',
              outline:    'none',
              fontSize:   '12px',
              color:      '#0A0A0A',
              background: 'transparent',
              width:      '200px',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E', fontSize: '14px', padding: 0, lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
        {matchedIds.size > 0 && (
          <div style={{
            background:   '#F5D63E',
            borderRadius: '8px',
            padding:      '6px 10px',
            fontSize:     '11px',
            fontWeight:   700,
            color:        '#0A0A0A',
            boxShadow:    '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {matchedIds.size} resultado{matchedIds.size !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Stats bar (bottom-left) */}
      <div style={{
        position:   'absolute',
        bottom:     '16px',
        left:       '16px',
        zIndex:     10,
        display:    'flex',
        gap:        '8px',
        alignItems: 'center',
      }}>
        <button
          onClick={() => { setExpandedModules(new Set()); setSelectedPanel(null); setSearchQuery('') }}
          style={{
            background:    '#0A0A0A',
            color:         '#F5F7E9',
            border:        'none',
            borderRadius:  '8px',
            padding:       '7px 13px',
            fontSize:      '11px',
            fontWeight:    700,
            letterSpacing: '0.06em',
            cursor:        'pointer',
          }}
        >
          RESET
        </button>
        <button
          onClick={() => {
            const allModuleIds = new Set(MAP_NODES.filter(n => n.type === 'module').map(n => n.id))
            setExpandedModules(allModuleIds)
          }}
          style={{
            background:    '#fff',
            color:         '#0A0A0A',
            border:        '1px solid #e0e0e0',
            borderRadius:  '8px',
            padding:       '7px 13px',
            fontSize:      '11px',
            fontWeight:    700,
            letterSpacing: '0.06em',
            cursor:        'pointer',
            boxShadow:     '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          EXPANDIR TODO
        </button>
        <div style={{
          background:   '#fff',
          borderRadius: '8px',
          padding:      '6px 12px',
          fontSize:     '11px',
          color:        '#555',
          border:       '1px solid #e0e0e0',
          boxShadow:    '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <span style={{ color: '#0F3F26', fontWeight: 700 }}>{dominated}</span>
          <span style={{ color: '#9E9E9E' }}> dom · </span>
          <span style={{ color: '#D4A800', fontWeight: 700 }}>{inProgress}</span>
          <span style={{ color: '#9E9E9E' }}> progreso · </span>
          <span style={{ color: '#555', fontWeight: 700 }}>{childCount}</span>
          <span style={{ color: '#9E9E9E' }}> nodos</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#e0e0e0" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={node => {
            if (node.type === 'moduleNode') {
              const fn = MAP_NODES.find(n => n.id === node.id)
              return getMasteryColor(mastery[fn?.module_id ?? ''])
            }
            return '#d0d0d0'
          }}
          style={{
            background:   '#f9f9f0',
            border:       '1px solid #e0e0e0',
            borderRadius: '10px',
          }}
          maskColor="rgba(240,240,230,0.6)"
        />
      </ReactFlow>

      {selectedPanel && (
        <SidePanel
          data={selectedPanel}
          slug={slug}
          onClose={() => setSelectedPanel(null)}
        />
      )}
    </div>
  )
}

// ── Wrapper con Provider ──────────────────────────────────────────────────────

export default function KnowledgeMap(props: KnowledgeMapProps) {
  return (
    <ReactFlowProvider>
      <KnowledgeMapInner {...props} />
    </ReactFlowProvider>
  )
}
