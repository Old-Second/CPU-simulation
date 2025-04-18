import {BaseEdge, EdgeLabelRenderer, getSmoothStepPath, Position} from 'reactflow';
import useDataStore from "../../store/useDataStore.ts";
import {DataState} from "../../type/Data.ts";
import {memo, useMemo, CSSProperties} from 'react';

// 使用选择器优化性能，只获取需要的状态
const selector = (state: {
  data: DataState;
}) => ({
  data: state.data,
});

// 将数字转换为十六进制显示格式
const formatHexDisplay = (value: number): string => {
  if (value <= 9) {
    return value.toString();
  }
  return `0x${value.toString(16).toUpperCase()}`;
};

// 使用memo优化组件，避免不必要的重渲染
const NumberEdge = memo(({
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition
}: {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position
}) => {
  const {data} = useDataStore(selector);
  
  // 使用useMemo缓存路径计算结果
  const [edgePath] = useMemo(() => getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
    offset: 0,
  }), [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  // 获取边的数据值并转换为十六进制显示
  const edgeValue = data[id]?.data;
  const displayValue = typeof edgeValue === 'number' ? formatHexDisplay(edgeValue) : edgeValue;

  // 使用useMemo缓存样式对象
  const labelStyle = useMemo<CSSProperties>(() => ({
    position: 'absolute',
    transform: `translate(${sourceX + 15}px,${sourceY - 30}px)`,
    pointerEvents: 'all' as const,
    background: 'white',
    padding: '2px 4px',
    borderRadius: '4px',
    fontSize: '12px',
    border: '1px solid #ccc'
  }), [sourceX, sourceY]);

  return (
    <>
      <BaseEdge id={id} path={edgePath}/>
      <EdgeLabelRenderer>
        <div style={labelStyle}>
          {displayValue}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

export default NumberEdge;