import './index.css'
import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Form, Input, InputNumber, message, Modal, Table} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const {Column} = Table;


const Ram = () => {
  const {data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [ramInput, setRamInput] = useState({A: 0, Din: 0, str: 0, C: 0, ld: 0});
  const [ramData, setRamData] = useState<{
    dataBits: number;
    addressBits: number;
    label: string,
  }>({addressBits: 1, dataBits: 1, label: "RAM"});
  const [DOut, setDOut] = useState<{ [address: string]: number; }>({0: 0});
  
  const prevRamInput = useRef(ramInput);
  
  useEffect(() => {
    setRamData((getChipData(nodeId) ?? getChipData('ram')) as { label: string, addressBits: number, dataBits: number });
  }, [chipData, getChipData, nodeId]);
  
  // 当数据或节点 ID 更改时更新数据
  useEffect(() => {
    const A = getData(nodeId, 'A');
    const str = getData(nodeId, 'str');
    const C = getData(nodeId, 'C');
    const Din = getData(nodeId, 'Din');
    setRamInput({A, Din, str, C, ld: getData(nodeId, 'ld')});
    // 如果满足条件，则更新 DOut
    if (prevRamInput.current.str === 1 && str === 1 && prevRamInput.current.C === 0 && C === 1) {
      setDOut(prevState => ({...prevState, [A]: Din}));
    }
    prevRamInput.current = ramInput;
  }, [data, getData, nodeId, ramInput]);
  
  // 当数据源更改时更新 D
  useEffect(() => {
    const {A, ld} = ramInput;
    if (ld === 1 && DOut[A]) {
      updateData(nodeId, 'D', DOut[A]);
    }
  }, [ramInput, nodeId, ramData, updateData, DOut]);
  
  const [open, setOpen] = useState(false);
  const openEditRam = () => setOpen(true);
  const closeEditRam = () => setOpen(false);
  
  // 处理表单提交
  const handleSubmit = (data: {
    dataBits: number;
    addressBits: number;
    label: string;
  }) => {
    setRamData(data);
    updateChipData(nodeId, data);
    void message.success('配置成功');
    closeEditRam();
  }
  
  return (
    <>
      <h3>{ramData.label}</h3>
      <div className="ram">
        {/* 节点端口 */}
        <p className={'ram-port ram-A'}>A</p>
        <p className={'ram-port ram-Din'}>Din</p>
        <p className={'ram-port ram-str'}>str</p>
        <p className={'ram-port ram-C'}>C</p>
        <p className={'ram-port ram-ld'}>ld</p>
        <p className={'ram-port ram-D'}>D</p>
        
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditRam}/>
          <RamModal open={open} closeEditRam={closeEditRam} DOut={DOut}
                    onSubmit={handleSubmit} initialValues={ramData}/>
        </NodeToolbar>
        
        <Handle type='target' id="A" position={Position.Left} style={{top: '10%'}}/>
        <Handle type='target' id="Din" position={Position.Left} style={{top: '30%'}}/>
        <Handle type='target' id="str" position={Position.Left} style={{top: '50%'}}/>
        <Handle type='target' id="C" position={Position.Left} style={{top: '70%'}}/>
        <Handle type='target' id="ld" position={Position.Left} style={{top: '90%'}}/>
        <Handle type='source' id="D" position={Position.Right}/>
      </div>
    </>
  );
}

export default Ram;

interface RamModalProps {
  open: boolean;
  closeEditRam: () => void;
  DOut: { [address: string]: number; };
  initialValues: {
    label: string;
    dataBits: number;
    addressBits: number;
  };
  onSubmit: (data: {
    dataBits: number;
    addressBits: number;
    label: string;
  }) => void;
}

const RamModal: React.FC<RamModalProps> = ({
                                             open, closeEditRam, DOut, initialValues, onSubmit
                                           }) => {
  const [form] = Form.useForm();
  const [dataBits, setDataBits] = useState<number>(initialValues.dataBits);
  const [addressBits, setAddressBits] = useState<number>(initialValues.addressBits);
  
  // 生成数据源
  const generateDataSource = useCallback((addressBits: number) => {
    const rowCount = Math.pow(2, addressBits);
    return Array.from({length: rowCount}, (_, i) => {
      const address = i > 9 ? `0x${i.toString(16).toUpperCase()}` : i.toString();
      let value: string;
      
      if (DOut[i]) {
        const binaryStr = String(DOut[i]);
        const slicedBinary = binaryStr.slice(-dataBits);
        const intValue = parseInt(slicedBinary, 2);
        value = intValue > 9 ? `0x${intValue.toString(16).toUpperCase()}` : String(intValue);
      } else value = '0'
      
      return {
        key: i,
        address,
        value,
      };
    });
  }, [DOut, dataBits]);
  
  // 使用 useMemo 缓存数据源
  const dataSource = useMemo(() => generateDataSource(addressBits), [generateDataSource, addressBits]);
  
  // 处理表单提交
  const handleOk = () => {
    form
      .validateFields()
      .then(onSubmit)
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };
  
  return (
    <Modal
      open={open}
      title={`${initialValues.label} 配置`}
      okText="确定"
      cancelText="取消"
      onCancel={closeEditRam}
      onOk={handleOk}
    >
      <Form form={form} name="RamConfiguration" initialValues={initialValues}>
        <Form.Item
          name="dataBits" label="Data Bits"
          rules={[{required: true, message: '请输入数据位数!'}]}
        >
          <InputNumber min={1} max={32} onChange={value => setDataBits(value as number)}/>
        </Form.Item>
        <Form.Item
          name="addressBits" label="Address Bits"
          rules={[{required: true, message: '请输入地址位数!'}]}
        >
          <InputNumber min={1} max={32} onChange={value => setAddressBits(value as number)}/>
        </Form.Item>
        <Form.Item
          name="label" label="label"
        >
          <Input/>
        </Form.Item>
      </Form>
      <Table
        dataSource={dataSource}
        pagination={false}
        bordered
        size="small"
      >
        <Column title="Address" dataIndex="address" key="address"/>
        <Column title="Value" dataIndex="value" key="value"/>
      </Table>
    </Modal>
  );
};