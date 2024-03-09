import './index.css';
import {Handle, NodeToolbar, Position, useNodeId, useUpdateNodeInternals} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useEffect, useState} from "react";
import {Form, Input, message, Modal, Select} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const TunnelIn = () => {
  const {data, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const updateNodeInternals = useUpdateNodeInternals();
  const [tunnelInInput, setTunnelInInput] = useState(0);
  const [tunnelInData, setTunnelInData] = useState({
    netName: "TunnelIn",
    rotation: 0,
  });
  
  useEffect(() => {
    setTunnelInData((getChipData(nodeId) ?? getChipData('tunnelIn')) as { netName: string; rotation: number; });
  }, [getChipData, nodeId]);
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [nodeId, tunnelInData, updateNodeInternals]);
  
  // 当数据或节点 ID 更改时更新
  useEffect(() => {
      setTunnelInInput(getData(nodeId, 'in'))
    }, [data, getData, nodeId]
  );
  
  // 更新输出
  useEffect(() => {
    updateData('TunnelIn', tunnelInData.netName, tunnelInInput);
  }, [tunnelInInput, nodeId, updateData, tunnelInData.netName]);
  
  const [open, setOpen] = useState(false);
  const openEditTunnelIn = () => setOpen(true);
  const closeEditTunnelIn = () => setOpen(false);
  
  
  // 处理表单提交
  const handleSubmit = (values: { netName: string; rotation: number; }) => {
    setTunnelInData({...values});
    updateChipData(nodeId, values);
    updateNodeInternals(nodeId);
    void message.success('配置成功');
    closeEditTunnelIn();
  };
  
  return (
    <>
      <h3>{tunnelInData.netName}</h3>
      <div className="tunnelIn" style={{transform: `rotate(${-tunnelInData.rotation}deg)`}}>
        
        <NodeToolbar isVisible={true} offset={0}>
          <EditOutlined onClick={openEditTunnelIn}/>
          <TunnelInModal open={open} closeEditTunnelIn={closeEditTunnelIn} initialValues={tunnelInData}
                         onSubmit={handleSubmit}/>
        </NodeToolbar>
        <Handle type='target' id="in" position={Position.Left} style={{left: '1px'}}/>
      </div>
    </>
  );
};

export default TunnelIn;

interface TunnelInModalProps {
  open: boolean;
  closeEditTunnelIn: () => void;
  initialValues: {
    netName: string;
    rotation: number;
  };
  onSubmit: (values: { netName: string; rotation: number; }) => void;
}

const TunnelInModal: React.FC<TunnelInModalProps> = ({open, closeEditTunnelIn, initialValues, onSubmit}) => {
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
      title={`${initialValues.netName} 配置`}
      okText="确定"
      cancelText="取消"
      onCancel={closeEditTunnelIn}
      onOk={handleOk}
    >
      <Form form={form} name="TunnelInConfiguration" initialValues={initialValues}>
        <Form.Item
          name="rotation" label="Rotation"
        >
          <Select options={[
            {value: 0, label: '0°'},
            {value: 90, label: '90°'},
            {value: 180, label: '180°'},
            {value: 270, label: '270°'}]}/>
        </Form.Item>
        <Form.Item
          name="netName" label="Net name"
        >
          <Input/>
        </Form.Item>
      </Form>
    </Modal>
  );
};