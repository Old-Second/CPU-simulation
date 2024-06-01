// 定义数据类型
export interface DataItem {
  sourceId: string;
  sourcePort: string;
  targetId: string;
  targetPort: string;
  data: number;
}

export interface DataState {
  [edgeId: string]: DataItem;
}

export interface ChipDataState {
  [nodeId: string]: ChipConfigValue;
}

export type ChipType = keyof ChipDataType;

export type ChipDataType = {
  digitalTube: DigitalTubeConfig;
  adder: AdderConfig;
  multiplexer: MultiplexerConfig;
  demultiplexer: DemultiplexerConfig;
  not: NotConfig;
  or: OrConfig;
  handInput: HandInputConfig;
  splitter: SplitterConfig;
  tunnelIn: TunnelInOutConfig;
  tunnelOut: TunnelInOutConfig;
  reg: RegConfig;
  ram: RamConfig;
  rom: RomConfig;
  constant: ConstantConfig;
}

export type ChipConfigValue = ChipDataType[keyof ChipDataType];

interface DigitalTubeConfig {
  label: string;
}

interface AdderConfig {
  label: string;
  dataBits: number;
}

interface MultiplexerConfig {
  label: string;
  rotation: number;
  dataBits: number;
  numberOfSelectorBits: number;
}

interface DemultiplexerConfig {
  label: string;
  rotation: number;
  dataBits: number;
  numberOfSelectorBits: number;
}

interface NotConfig {
  label: string;
  rotation: number;
}

interface OrConfig {
  label: string;
  rotation: number;
}

interface HandInputConfig {
  label: string;
  dataBits: number;
}

interface SplitterConfig {
  label: string;
  InputSplitting: string;
  OutputSplitting: string;
}

interface TunnelInOutConfig {
  netName: string;
  rotation: number;
}

interface RegConfig {
  dataBits: number;
  label: string;
}

interface RamConfig {
  addressBits: number;
  dataBits: number;
  label: string;
}

interface RomConfig {
  addressBits: number;
  dataBits: number;
  label: string;
  dataSource: { [address: string]: number; };
}

interface ConstantConfig {
  label: string;
  value: number;
}

export const chipData: ChipDataType = {
  digitalTube: {
    label: "DigitalTube",
  },
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
  or: {
    label: "Or",
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
  constant: {
    label: "Constant",
    value: 1,
  },
}