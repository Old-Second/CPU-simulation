import DigitalTube from "../Components/Chips/DigitalTube/DigitalTube.tsx";
import Rom from "../Components/Chips/Rom/Rom.tsx";
import Adder from "../Components/Chips/Adder/Adder.tsx";
import Multiplexer from "../Components/Chips/Multiplexer/Multiplexer.tsx";
import Ram from "../Components/Chips/Ram/Ram.tsx";
import Demultiplexer from "../Components/Chips/Demultiplexer/Demultiplexer.tsx";
import Not from "../Components/Chips/Not/Not.tsx";
import HandInput from "../Components/Chips/HandInput/HandInput.tsx";
import Splitter from "../Components/Chips/Splitter/Splitter.tsx";
import Reg from "../Components/Chips/Reg/Reg.tsx";
import TunnelOut from "../Components/Chips/Tunnel/TunnelOut.tsx";
import TunnelIn from "../Components/Chips/Tunnel/TunnelIn.tsx";
import Constant from "../Components/Chips/Constant/Constant.tsx";
import Or from "../Components/Chips/Or/Or.tsx";
import React from "react";
import {ChipType} from "./Data.ts";

type NodeTypesKeys = {
  [K in ChipType]: React.FC;
}

export const NodeTypes: NodeTypesKeys = {
  digitalTube: DigitalTube,
  rom: Rom,
  ram: Ram,
  reg: Reg,
  adder: Adder,
  multiplexer: Multiplexer,
  demultiplexer: Demultiplexer,
  not: Not,
  or: Or,
  constant: Constant,
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