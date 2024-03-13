// import TestCounter from "../Components/elements/use/testCounter.tsx";
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
import Reg from "../Components/Reg/Reg.tsx";
import TunnelOut from "../Components/Tunnel/TunnelOut.tsx";
import TunnelIn from "../Components/Tunnel/TunnelIn.tsx";

export const NodeTypes = {
  // circuitNode: CircuitNode,
  // counter: TestCounter,
  // userom: UseRom,
  digitalTube: DigitalTube,
  rom: Rom,
  ram: Ram,
  reg: Reg,
  adder: Adder,
  multiplexer: Multiplexer,
  demultiplexer: Demultiplexer,
  not: Not,
  one: One,
  zero: Zero,
  handInput: HandInput,
  splitter: Splitter,
  tunnelIn: TunnelIn,
  tunnelOut: TunnelOut,
};
// const edgeTypes = {
//   step: {
//     type: 'step',
//     // label: 'Step Edge',
//     // style: { stroke: '#f6ab6c' } // 设置样式
//   }
// };

export const chipData = {
  adder: {
    label: "Adder",
    dataBits: 1
  },
  multiplexer: {
    label: "Multiplexer",
    rotation: 0,
    dataBits: 1,
    numberOfSelectorBits: 1
  },
  demultiplexer: {
    label: "Demultiplexer",
    rotation: 0,
    dataBits: 1,
    numberOfSelectorBits: 1
  },
  not: {
    label: "Not",
    rotation: 0,
  },
  handInput: {
    label: "HandInput",
    dataBits: 1,
  },
  splitter: {
    label: "Splitter",
    InputSplitting: '4,4',
    OutputSplitting: '8',
  },
  tunnelIn: {
    netName: "TunnelIn",
    rotation: 0,
  },
  tunnelOut: {
    netName: "TunnelOut",
    rotation: 0,
  },
  reg: {
    dataBits: 1,
    label: "Reg"
  },
  ram: {
    addressBits: 1,
    dataBits: 1,
    label: "RAM"
  },
  rom: {
    addressBits: 1,
    dataBits: 1,
    label: "ROM",
    dataSource: {}
  },
  one: {
    label: "1",
    dataBits: 1,
  },
  zero: {
    label: "0",
    dataBits: 1,
  }
}