import './index.css'
import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useEffect, useRef, useState} from "react";
import {Form, Input, InputNumber, message, Modal} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";


const Reg = () => {
  const {data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [regInput, setRegInput] = useState({D: 0, C: 0, en: 0});
  const [regData, setRegData] = useState<{ dataBits: number; label: string }>({
    dataBits: 1,
    label: "Reg"
  });
  const [Q, setQ] = useState<number>(0);
  
  const prevRegInput = useRef(regInput);
  
  useEffect(() => {
    setRegData((getChipData(nodeId) ?? getChipData('reg')) as { dataBits: number; label: string });
  }, [chipData, getChipData, nodeId]);
  
  // 当数据或节点 ID 更改时更新数据
  useEffect(() => {
    const D = getData(nodeId, 'D');
    const C = getData(nodeId, 'C');
    const en = getData(nodeId, 'en');
    setRegInput({D, C, en});
    // 如果满足条件，则更新 Q
    if (prevRegInput.current.en === 1 && en === 1 && prevRegInput.current.C === 0 && C === 1) {
      setQ(D);
    }
    prevRegInput.current = regInput;
  }, [data, getData, nodeId, regInput]);
  
  // 当数据源更改时更新 Q
  useEffect(() => {
    updateData(nodeId, 'Q', Q);
  }, [nodeId, updateData, Q]);
  
  const [open, setOpen] = useState(false);
  const openEditReg = () => setOpen(true);
  const closeEditReg = () => setOpen(false);
  
  // 处理表单提交
  const handleSubmit = (data: {
    dataBits: number;
    label: string;
  }) => {
    setRegData(data);
    updateChipData(nodeId, data);
    void message.success('配置成功');
    closeEditReg();
  }
  
  return (
    <>
      <h3>{regData.label}</h3>
      <div className="reg">
        {/* 节点端口 */}
        <p className={'reg-port reg-D'}>D</p>
        <p className={'reg-port reg-C'}>C</p>
        <p className={'reg-port reg-en'}>en</p>
        <p className={'reg-port reg-Q'}>Q</p>
        
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditReg}/>
          <RegModal open={open} closeEditReg={closeEditReg} onSubmit={handleSubmit} initialValues={regData}/>
        </NodeToolbar>
        
        <Handle type='target' id="D" position={Position.Left} style={{top: '20%'}}/>
        <Handle type='target' id="C" position={Position.Left} style={{top: '50%'}}/>
        <Handle type='target' id="en" position={Position.Left} style={{top: '80%'}}/>
        <Handle type='source' id="Q" position={Position.Right}/>
      </div>
    </>
  );
}

export default Reg;

interface RegModalProps {
  open: boolean;
  closeEditReg: () => void;
  initialValues: {
    label: string;
    dataBits: number;
  };
  onSubmit: (data: {
    dataBits: number;
    label: string;
  }) => void;
}

const RegModal: React.FC<RegModalProps> = ({
                                             open, closeEditReg, initialValues, onSubmit
                                           }) => {
  const [form] = Form.useForm();
  
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
      onCancel={closeEditReg}
      onOk={handleOk}
    >
      <Form form={form} name="RegConfiguration" initialValues={initialValues}>
        <Form.Item
          name="dataBits" label="Data Bits"
          rules={[{required: true, message: '请输入数据位数!'}]}
        >
          <InputNumber min={1} max={32}/>
        </Form.Item>
        <Form.Item
          name="label" label="label"
        >
          <Input/>
        </Form.Item>
      </Form>
    </Modal>
  );
};