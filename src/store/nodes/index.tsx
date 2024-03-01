import {Edge} from "reactflow";

export const initialNodes = [
  {
    id: '0',
    type: 'digitalTube',
    position: {x: 200, y: 250},
  },
  {
    id: '1',
    type: 'rom',
    position: {x: 400, y: 150},
  },
  {
    id: '11',
    type: 'multiplexer',
    position: {x: 400, y: 150},
  },
  {
    id: '2',
    type: 'one',
    position: {x: 400, y: 150},
  },
  {
    id: '3',
    type: 'zero',
    position: {x: 400, y: 350},
  },
  {
    id: '4',
    type: 'one',
    position: {x: 400, y: 350},
  },
];

export const initialEdges: Edge[] = [
  // {id: '1', source: '0', target: '1', type: 'step'},
  // {id: '2', source: '0', target: '1', type: 'step'},
  // {id: '3', source: '0', target: '2', type: 'step'},
  // {id: '4', source: '1', target: '2', type: 'step'},
  // {id: 'e0-3', source: '0', target: '3', sourceHandle: 'left', targetHandle: 'right'},
  // {id: 'e0-4', source: '0', target: '4', sourceHandle: 'right', targetHandle: 'left'},
  // {id: 'e0-5', source: '0', target: '5', sourceHandle: 'right', targetHandle: 'left'},
  // {id: 'e0-6', source: '0', target: '6', sourceHandle: 'right', targetHandle: 'left'},
];