import TestCounter from "../Components/elements/use/testCounter.tsx";
import DigitalTube from "../Components/DigitalTube/DigitalTube.tsx";
import Rom from "../Components/Rom/Rom.tsx";
import Adder from "../Components/Adder/Adder.tsx";
import Multiplexer from "../Components/Multiplexer/Multiplexer.tsx";
import One from "../Components/One/One.tsx";
import Zero from "../Components/Zero/Zero.tsx";

export const NodeTypes = {
  // circuitNode: CircuitNode,
  counter: TestCounter,
  // userom: UseRom,
  digitalTube: DigitalTube,
  rom: Rom,
  adder: Adder,
  multiplexer: Multiplexer,
  one: One,
  zero: Zero,
};
// const edgeTypes = {
//   step: {
//     type: 'step',
//     // label: 'Step Edge',
//     // style: { stroke: '#f6ab6c' } // 设置样式
//   }
// };