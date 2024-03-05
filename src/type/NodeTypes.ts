import TestCounter from "../Components/elements/use/testCounter.tsx";
import DigitalTube from "../Components/DigitalTube/DigitalTube.tsx";
import Rom from "../Components/Rom/Rom.tsx";
import Adder from "../Components/Adder/Adder.tsx";
import Multiplexer from "../Components/Multiplexer/Multiplexer.tsx";
import One from "../Components/One/One.tsx";
import Zero from "../Components/Zero/Zero.tsx";
import Ram from "../Components/Ram/Ram.tsx";
import Demultiplexer from "../Components/Demultiplexer/Demultiplexer.tsx";
import Not from "../Components/Not/Not.tsx";
import HandInput from "../Components/HandInput/HandInput.tsx";
import Splitter from "../Components/Splitter/Splitter.tsx";

export const NodeTypes = {
  // circuitNode: CircuitNode,
  counter: TestCounter,
  // userom: UseRom,
  digitalTube: DigitalTube,
  rom: Rom,
  ram: Ram,
  adder: Adder,
  multiplexer: Multiplexer,
  demultiplexer: Demultiplexer,
  not: Not,
  one: One,
  zero: Zero,
  handInput: HandInput,
  splitter: Splitter,
};
// const edgeTypes = {
//   step: {
//     type: 'step',
//     // label: 'Step Edge',
//     // style: { stroke: '#f6ab6c' } // 设置样式
//   }
// };