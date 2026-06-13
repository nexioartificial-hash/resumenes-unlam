// src/components/subject/KnowledgeMap.tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'

import {
  FILOSOFIA_NODES,
  FILOSOFIA_EDGES,
} from '@/data/knowledge-maps/filosofia'

// ── Helpers de mastery ────────────────────────────────────────────────────────

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

// ── Tipos de datos de nodos ──────────────────────────────────────────────────

type ModuleNodeData = {
  label:    string
  num:      number
  mastery?: number
  expanded: boolean
  onToggle: () => void
}

type ChildNodeData = {
  label:       string
  nodeType:    'author' | 'concept'
  description: string
  module_id:   string
  moduleLabel: string
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
        minWidth:     '160px',
        cursor:       'pointer',
        userSelect:   'none',
        border:       `2px solid ${bg === '#9E9E9E' ? '#ccc' : bg}`,
        boxShadow:    '0 2px 8px rgba(0,0,0,0.15)',
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
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
  const icon = data.nodeType === 'author' ? '👤' : '💡'

  return (
    <div
      onClick={data.onSelect}
      style={{
        background:   '#fff',
        borderRadius: '8px',
        padding:      '7px 12px',
        minWidth:     '120px',
        maxWidth:     '160px',
        cursor:       'pointer',
        userSelect:   'none',
        border:       '1.5px solid #e0e0e0',
        boxShadow:    '0 1px 4px rgba(0,0,0,0.08)',
        display:      'flex',
        alignItems:   'center',
        gap:          '6px',
        fontSize:     '12px',
        color:        '#0A0A0A',
      }}
    >
      <span style={{ fontSize: '14px' }}>{icon}</span>
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
}

function SidePanel({
  data,
  slug,
  onClose,
}: {
  data:    PanelData
  slug:    string
  onClose: () => void
}) {
  const router = useRouter()

  return (
    <div
      style={{
        position:      'absolute',
        top:           '16px',
        right:         '16px',
        width:         '280px',
        background:    '#fff',
        borderRadius:  '16px',
        padding:       '20px',
        boxShadow:     '0 4px 24px rgba(0,0,0,0.12)',
        border:        '1px solid rgba(10,10,10,0.08)',
        zIndex:        10,
        display:       'flex',
        flexDirection: 'column',
        gap:           '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            {data.moduleLabel}
          </div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#0A0A0A' }}>
            {data.label}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E', fontSize: '18px', padding: '0', lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>
        {data.description}
      </p>
      <button
        onClick={() => router.push(`/dashboard/${slug}/modulos/${data.module_id}`)}
        style={{
          background:    '#0F3F26',
          color:         '#F5F7E9',
          border:        'none',
          borderRadius:  '8px',
          padding:       '8px 16px',
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

// ── Componente principal ──────────────────────────────────────────────────────

export interface KnowledgeMapProps {
  mastery: Record<string, number>
  slug:    string
}

export default function KnowledgeMap({ mastery, slug }: KnowledgeMapProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [selectedPanel,   setSelectedPanel]   = useState<PanelData | null>(null)

  const masteryRef = useRef(mastery)
  useEffect(() => { masteryRef.current = mastery }, [mastery])

  const buildNodes = useCallback(
    (expanded: Set<string>): Node[] => {
      const moduleNodes = FILOSOFIA_NODES.filter(n => n.type === 'module')
      return FILOSOFIA_NODES.map(fn => {
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
              label:    fn.label,
              num:      moduleIdx + 1,
              mastery:  masteryRef.current[fn.module_id ?? ''],
              expanded: expanded.has(fn.id),
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

        const parentMod = FILOSOFIA_NODES.find(n => n.id === fn.parent)
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
            onSelect:    () => setSelectedPanel({
              label:       fn.label,
              description: fn.description,
              module_id:   fn.module_id ?? '',
              moduleLabel: parentMod?.label ?? '',
            }),
          } as ChildNodeData,
        }
      })
    },
    []
  )

  const buildEdges = useCallback((expanded: Set<string>): Edge[] => {
    return FILOSOFIA_EDGES.map(fe => {
      const isHierarchy = fe.type === 'hierarchy'

      if (isHierarchy) {
        return {
          id:     fe.id,
          source: fe.source,
          target: fe.target,
          hidden: !expanded.has(fe.source),
          type:   'smoothstep',
          style:  { stroke: '#ccc', strokeWidth: 1.5 },
        }
      }

      const srcFn = FILOSOFIA_NODES.find(n => n.id === fe.source)
      const tgtFn = FILOSOFIA_NODES.find(n => n.id === fe.target)
      const srcHidden = srcFn?.parent ? !expanded.has(srcFn.parent) : false
      const tgtHidden = tgtFn?.parent ? !expanded.has(tgtFn.parent) : false

      return {
        id:       fe.id,
        source:   fe.source,
        target:   fe.target,
        hidden:   srcHidden || tgtHidden,
        type:     'smoothstep',
        animated: true,
        style:    { stroke: '#0F3F26', strokeWidth: 1, strokeDasharray: '5,5' },
      }
    })
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes(expandedModules))
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(expandedModules))

  useEffect(() => {
    setNodes(buildNodes(expandedModules))
    setEdges(buildEdges(expandedModules))
  }, [expandedModules, buildNodes, buildEdges, setNodes, setEdges])

  const handleReset = useCallback(() => {
    setExpandedModules(new Set())
    setSelectedPanel(null)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e0e0e0" />
        <Controls showInteractive={false} />
      </ReactFlow>

      <button
        onClick={handleReset}
        style={{
          position:      'absolute',
          bottom:        '16px',
          left:          '16px',
          background:    '#0A0A0A',
          color:         '#F5F7E9',
          border:        'none',
          borderRadius:  '8px',
          padding:       '8px 14px',
          fontSize:      '11px',
          fontWeight:    700,
          letterSpacing: '0.06em',
          cursor:        'pointer',
          zIndex:        10,
        }}
      >
        RESET VISTA
      </button>

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
