import CartesianPlane from './CartesianPlane'
import VennAB from './VennAB'
import FunctionMapping from './FunctionMapping'
import ProbabilityLine from './ProbabilityLine'

const MAP: Record<string, React.ComponentType> = {
  'cartesian-plane':  CartesianPlane,
  'venn-ab':          VennAB,
  'function-mapping': FunctionMapping,
  'probability-line': ProbabilityLine,
}

export function isFigure(name: string): boolean {
  return name in MAP
}

export default function Figure({ name }: { name: string }) {
  const Cmp = MAP[name]
  if (!Cmp) return null
  return (
    <span className="not-prose my-6 flex justify-center">
      <Cmp />
    </span>
  )
}
