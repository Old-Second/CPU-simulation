import './index.css';
import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useEffect, useState} from "react";
import {Form, InputNumber, Input, message, Modal} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const Adder = () => {
  const {edges, data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [adderInput, setAdderInput] = useState({a: 0, b: 0, c_i: 0});
  const [adderData, setAdderData] = useState({
    label: "Adder",
    dataBits: 1
  });
  
  useEffect(() => {
    setAdderData((getChipData(nodeId) ?? getChipData('adder')) as { label: string, dataBits: number });
  }, [chipData, getChipData, nodeId]);
  
  // 当数据或节点 ID 更改时更新 a, b, 和 c_i
  useEffect(() => {
      setAdderInput({
        a: getData(nodeId, 'a'),
        b: getData(nodeId, 'b'),
        c_i: getData(nodeId, 'c_i')
      })
    }, [data, getData, nodeId]
  );
  
  // 当 a, b 或 c_i 更改时更新输出
  useEffect(() => {
    const {a, b, c_i} = adderInput;
    let sum = '', co = c_i;
    
    const binA = (a?.toString() ?? '').padStart(adderData.dataBits, '0');
    const binB = (b?.toString() ?? '').padStart(adderData.dataBits, '0');
    console.log(binA, binB)
    for (let i = adderData.dataBits - 1; i >= 0; i--) {
      const digitA = parseInt(binA[i], 2);
      const digitB = parseInt(binB[i], 2);
      
      // 计算当前位的和
      const s = (digitA ^ digitB ^ co).toString();
      
      // 更新结果和进位
      sum = s + sum;
      co = ((digitA & digitB) | (digitA & co) | (digitB & co));
    }
    
    updateData(nodeId, 's', parseInt(sum));
    updateData(nodeId, 'c_o', co);
  }, [edges, adderInput, adderData.dataBits, nodeId, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditAdder = () => setOpen(true);
  const closeEditAdder = () => setOpen(false);
  
  
  // 处理表单提交
  const handleSubmit = (values: { label: string; dataBits: number; }) => {
    setAdderData({...values});
    updateChipData(nodeId, values);
    void message.success('配置成功');
    closeEditAdder();
  };
  
  return (
    <>
      <h3>{adderData.label}</h3>
      <div className="adder">
        {/* 节点端口 */}
        <p className={'adder-port adder-a'}>A</p>
        <p className={'adder-port adder-b'}>B</p>
        <p className={'adder-port adder-c_i'}>C<sub>i</sub></p>
        <p className={'adder-port adder-s'}>S</p>
        <p className={'adder-port adder-c_o'}>C<sub>o</sub></p>
        
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditAdder}/>
          <AdderModal open={open} closeEditAdder={closeEditAdder} initialValues={adderData} onSubmit={handleSubmit}/>
        </NodeToolbar>
        
        <Handle type='target' id="a" position={Position.Left} style={{top: '20%'}}/>
        <Handle type='target' id="b" position={Position.Left} style={{top: '50%'}}/>
        <Handle type='target' id="c_i" position={Position.Left} style={{top: '80%'}}/>
        <Handle type='source' id="s" position={Position.Right} style={{top: '20%'}}/>
        <Handle type='source' id="c_o" position={Position.Right} style={{top: '50%'}}/>
      </div>
    </>
  );
};

export default Adder;

interface AdderModalProps {
  open: boolean;
  closeEditAdder: () => void;
  initialValues: {
    label: string;
    dataBits: number;
  };
  onSubmit: (values: { label: string; dataBits: number; }) => void;
}

const AdderModal: React.FC<AdderModalProps> = ({open, closeEditAdder, initialValues, onSubmit}) => {
  const [form] = Form.useForm();
  
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
      onCancel={closeEditAdder}
      onOk={handleOk}
    >
      <Form form={form} name="AdderConfiguration" initialValues={initialValues}>
        <Form.Item
          name="label" label="Label"
        >
          <Input/>
        </Form.Item>
        <Form.Item
          name="dataBits" label="Data Bits"
          rules={[{required: true, message: '请输入数据位数!'}]}
        >
          <InputNumber min={1} max={32}/>
        </Form.Item>
      </Form>
    </Modal>
  );
};