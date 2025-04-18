import { EdgeLabelRenderer, Position, useReactFlow, getSmoothStepPath } from 'reactflow';
import useDataStore from "../../store/useDataStore.ts";
import { DataState } from "../../type/Data.ts";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";

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

// 定义路径点类型
interface PathPoint {
    x: number;
    y: number;
}

export default function CustomPathEdge({
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
}) {
    const { data } = useDataStore(selector);
    const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [svgPath, setSvgPath] = useState<string>("");
    const pathRef = useRef<SVGPathElement>(null);
    const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);
    const [isInitialPath, setIsInitialPath] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [lastSourcePoint, setLastSourcePoint] = useState<PathPoint>({ x: sourceX, y: sourceY });
    const [lastTargetPoint, setLastTargetPoint] = useState<PathPoint>({ x: targetX, y: targetY });
    const [savedPathPoints, setSavedPathPoints] = useState<PathPoint[]>([]);
    const [isStepMode, setIsStepMode] = useState(true);
    const dragStartTimeRef = useRef<number>(0);
    const dragEndTimeRef = useRef<number>(0);

    // 获取ReactFlow实例
    const { screenToFlowPosition } = useReactFlow();

    // 检查起点或终点是否有变化
    const sourceChanged = useMemo(() => 
        lastSourcePoint.x !== sourceX || lastSourcePoint.y !== sourceY, 
        [lastSourcePoint, sourceX, sourceY]
    );
    
    const targetChanged = useMemo(() => 
        lastTargetPoint.x !== targetX || lastTargetPoint.y !== targetY, 
        [lastTargetPoint, targetX, targetY]
    );

    // 初始化路径点
    useEffect(() => {
        setPathPoints([
            { x: sourceX, y: sourceY },
            { x: targetX, y: targetY }
        ]);
        setLastSourcePoint({ x: sourceX, y: sourceY });
        setLastTargetPoint({ x: targetX, y: targetY });
    }, [sourceX, sourceY, targetX, targetY]);

    // 从Step路径中提取拐点
    const extractStepPathPoints = useCallback(() => {
        const [path] = getSmoothStepPath({
            sourceX,
            sourceY,
            targetX,
            targetY,
            sourcePosition,
            targetPosition,
            borderRadius: 0,
        });
        
        // 解析SVG路径，提取拐点
        const points: PathPoint[] = [];
        const commands = path.split(/(?=[ML])/);
        
        for (const cmd of commands) {
            if (cmd.startsWith('M') || cmd.startsWith('L')) {
                const coords = cmd.substring(1).trim().split(/\s+/);
                if (coords.length >= 2) {
                    points.push({
                        x: parseFloat(coords[0]),
                        y: parseFloat(coords[1])
                    });
                }
            }
        }
        
        return points;
    }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

    // 生成Step路径
    const generateStepPath = useCallback(() => {
        const [path] = getSmoothStepPath({
            sourceX,
            sourceY,
            targetX,
            targetY,
            sourcePosition,
            targetPosition,
            borderRadius: 0,
        });
        return path;
    }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

    // 生成自定义路径
    const generateCustomPath = useCallback((points: PathPoint[]) => {
        if (points.length < 2) return "";
        
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x} ${points[i].y}`;
        }
        return path;
    }, []);

    // 更新SVG路径
    useEffect(() => {
        if (pathPoints.length < 2) return;
        
        if (isInitialPath || sourceChanged || targetChanged) {
            // 起点或终点有变化时使用StepEdge逻辑
            const path = generateStepPath();
            setSvgPath(path);
            
            // 更新路径点
            setPathPoints([
                { x: sourceX, y: sourceY },
                { x: targetX, y: targetY }
            ]);
            
            // 更新最后的起点和终点
            setLastSourcePoint({ x: sourceX, y: sourceY });
            setLastTargetPoint({ x: targetX, y: targetY });
            
            // 设置为Step模式
            setIsStepMode(true);
            
            // 如果有保存的路径点，更新它们
            if (savedPathPoints.length > 0) {
                const newSavedPoints = [...savedPathPoints];
                newSavedPoints[0] = { x: sourceX, y: sourceY };
                newSavedPoints[newSavedPoints.length - 1] = { x: targetX, y: targetY };
                setSavedPathPoints(newSavedPoints);
            }
        } else if (!isEditing) {
            // 非编辑模式下使用保存的路径点或自定义路径点生成路径
            if (isStepMode) {
                // 使用StepEdge逻辑
                const path = generateStepPath();
                setSvgPath(path);
            } else {
                // 使用自定义路径点
                const pointsToUse = savedPathPoints.length > 0 ? savedPathPoints : pathPoints;
                const path = generateCustomPath(pointsToUse);
                setSvgPath(path);
            }
        } else {
            // 编辑模式下使用自定义路径点生成路径
            const path = generateCustomPath(pathPoints);
            setSvgPath(path);
        }
    }, [
        pathPoints, 
        isEditing, 
        isInitialPath, 
        sourceX, 
        sourceY, 
        targetX, 
        targetY, 
        sourcePosition, 
        targetPosition, 
        lastSourcePoint, 
        lastTargetPoint, 
        savedPathPoints, 
        isStepMode,
        sourceChanged,
        targetChanged,
        generateStepPath,
        generateCustomPath
    ]);

    // 处理画布点击事件
    useEffect(() => {
        if (!isEditing) return;
        
        const handleCanvasClick = (event: MouseEvent) => {
            // 如果正在拖拽点，不添加新点
            if (draggingPointIndex !== null || isDragging) return;
            
            // 检查是否是拖拽后的点击（防止拖拽结束后立即触发点击事件）
            const clickTime = Date.now();
            if (clickTime - dragEndTimeRef.current < 300) return;
            
            // 检查点击是否在路径点上
            const target = event.target as HTMLElement;
            if (target.closest('.point-circle')) return;
            
            // 使用screenToFlowPosition方法将屏幕坐标转换为画布坐标
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            
            // 在最后一个点之前插入新点
            setPathPoints(prevPoints => {
                const newPoints = [...prevPoints];
                newPoints.splice(newPoints.length - 1, 0, { 
                    x: position.x, 
                    y: position.y 
                });
                return newPoints;
            });
        };
        
        document.addEventListener('click', handleCanvasClick);
        
        return () => {
            document.removeEventListener('click', handleCanvasClick);
        };
    }, [isEditing, screenToFlowPosition, draggingPointIndex, isDragging]);

    // 处理双击事件
    const handleDoubleClick = useCallback((event: React.MouseEvent) => {
        event.stopPropagation(); // 阻止事件冒泡
        
        if (isEditing) {
            // 退出编辑模式时保存当前路径点
            setSavedPathPoints([...pathPoints]);
            setIsEditing(false);
            setIsInitialPath(false);
            setIsStepMode(false); // 退出编辑模式时设置为非Step模式
        } else {
            // 进入编辑模式时，根据当前模式设置路径点
            if (isStepMode) {
                // 如果是Step模式，从Step路径中提取拐点
                const stepPoints = extractStepPathPoints();
                setPathPoints(stepPoints);
            } else if (savedPathPoints.length > 0) {
                // 如果有保存的路径点，使用它们
                setPathPoints([...savedPathPoints]);
            } else {
                // 否则重置为起点和终点
                setPathPoints([
                    { x: sourceX, y: sourceY },
                    { x: targetX, y: targetY }
                ]);
            }
            setIsEditing(true);
        }
        
        const canvas = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (canvas) {
            canvas.style.cursor = isEditing ? 'default' : 'crosshair';
        }
    }, [isEditing, sourceX, sourceY, targetX, targetY, pathPoints, savedPathPoints, isStepMode, extractStepPathPoints]);

    // 处理路径点拖拽开始
    const handlePointMouseDown = useCallback((event: React.MouseEvent, index: number) => {
        event.stopPropagation(); // 阻止事件冒泡
        event.preventDefault(); // 阻止默认行为
        if (index === 0 || index === pathPoints.length - 1) return; // 不允许拖拽起点和终点
        setDraggingPointIndex(index);
        setIsDragging(true);
        dragStartTimeRef.current = Date.now();
    }, [pathPoints.length]);

    // 处理路径点拖拽
    useEffect(() => {
        if (draggingPointIndex === null) return;
        
        let isDraggingActive = true;
        
        const handleMouseMove = (event: MouseEvent) => {
            if (!isDraggingActive) return;
            event.preventDefault();
            event.stopPropagation();
            
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            
            setPathPoints(prevPoints => {
                const newPoints = [...prevPoints];
                newPoints[draggingPointIndex] = { x: position.x, y: position.y };
                return newPoints;
            });
        };
        
        const handleMouseUp = (event: MouseEvent) => {
            if (!isDraggingActive) return;
            event.preventDefault();
            event.stopPropagation();
            
            isDraggingActive = false;
            dragEndTimeRef.current = Date.now();
            setDraggingPointIndex(null);
            setIsDragging(false);
        };
        
        // 使用 capture 和 passive: false 来确保我们可以阻止默认行为
        document.addEventListener('mousemove', handleMouseMove, { capture: true, passive: false });
        document.addEventListener('mouseup', handleMouseUp, { capture: true, passive: false });
        
        return () => {
            isDraggingActive = false;
            document.removeEventListener('mousemove', handleMouseMove, { capture: true });
            document.removeEventListener('mouseup', handleMouseUp, { capture: true });
            setDraggingPointIndex(null);
            setIsDragging(false);
        };
    }, [draggingPointIndex, screenToFlowPosition]);

    // 处理路径点删除
    const handlePointDoubleClick = useCallback((event: React.MouseEvent, index: number) => {
        event.stopPropagation(); // 阻止事件冒泡
        event.preventDefault(); // 阻止默认行为
        
        if (index === 0 || index === pathPoints.length - 1) return; // 不允许删除起点和终点
        
        const newPoints = [...pathPoints];
        newPoints.splice(index, 1);
        setPathPoints(newPoints);
    }, [pathPoints]);

    // 获取边的数据值并转换为十六进制显示
    const edgeValue = data[id]?.data;
    const displayValue = typeof edgeValue === 'number' ? formatHexDisplay(edgeValue) : edgeValue;

    // 使用useMemo计算路径样式
    const pathStyle = useMemo(() => ({
        strokeWidth: 2,
        stroke: isEditing ? '#ff0000' : '#000000',
        fill: 'none',
        cursor: isEditing ? 'crosshair' : 'pointer'
    }), [isEditing]);

    return (
        <>
            <g className="react-flow__edge-path" onDoubleClick={handleDoubleClick}>
                <path
                    ref={pathRef}
                    id={id}
                    d={svgPath}
                    style={pathStyle}
                />
                {/* 显示路径点 */}
                {isEditing && pathPoints.map((point, index) => (
                    <g key={index}>
                        <circle
                            className="point-circle"
                            cx={point.x}
                            cy={point.y}
                            r={4}
                            fill={index === 0 || index === pathPoints.length - 1 ? '#1a192b' : '#ff0000'}
                            stroke="#fff"
                            strokeWidth={1}
                            style={{
                                cursor: index === 0 || index === pathPoints.length - 1 ? 'default' : 'move'
                            }}
                        />
                        {index !== 0 && index !== pathPoints.length - 1 && (
                            <circle
                                className="point-circle"
                                cx={point.x}
                                cy={point.y}
                                r={8}
                                fill="transparent"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handlePointMouseDown(e, index);
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    handlePointDoubleClick(e, index);
                                }}
                                style={{ cursor: 'move' }}
                            />
                        )}
                    </g>
                ))}
            </g>
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(${sourceX + 15}px,${sourceY - 30}px)`,
                        pointerEvents: 'all',
                        background: 'white',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: '1px solid #ccc'
                    }}
                >
                    {displayValue}
                </div>
            </EdgeLabelRenderer>
        </>
    );
} 