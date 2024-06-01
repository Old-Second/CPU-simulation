import './index.css';
import {Handle, NodeToolbar, Position, useNodeId, useUpdateNodeInternals} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useEffect, useState} from "react";
import {Form, Input, message, Modal, Select} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const TunnelOut = () => {
  const {edges, data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const updateNodeInternals = useUpdateNodeInternals();
  const [tunnelOutInput, setTunnelOutInput] = useState(0);
  const [tunnelOutData, setTunnelOutData] = useState({
    netName: "TunnelOut",
    rotation: 0,
  });
  
  useEffect(() => {
    setTunnelOutData((getChipData(nodeId) ?? getChipData('tunnelOut')) as { netName: string; rotation: number; });
  }, [chipData, getChipData, nodeId]);
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [nodeId, tunnelOutData, updateNodeInternals]);
  
  // 当数据或节点 ID 更改时更新
  useEffect(() => {
      setTunnelOutInput(getData('TunnelOut', tunnelOutData.netName))
    }, [data, getData, nodeId, tunnelOutData.netName]
  );
  
  // 更新输出
  useEffect(() => {
    updateData(nodeId, 'out', tunnelOutInput);
  }, [edges, tunnelOutInput, nodeId, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditTunnelOut = () => setOpen(true);
  const closeEditTunnelOut = () => setOpen(false);
  
  
  // 处理表单提交
  const handleSubmit = (values: { netName: string; rotation: number; }) => {
    setTunnelOutData({...values});
    updateChipData(nodeId, values);
    updateNodeInternals(nodeId);
    void message.success('配置成功');
    closeEditTunnelOut();
  };
  
  return (
    <>
      <h3>{tunnelOutData.netName}</h3>
      <div className="tunnelOut" style={{transform: `rotate(${-tunnelOutData.rotation}deg)`}}>
        
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditTunnelOut}/>
          <TunnelOutModal open={open} closeEditTunnelOut={closeEditTunnelOut} initialValues={tunnelOutData}
                          onSubmit={handleSubmit}/>
        </NodeToolbar>
        <Handle type='source' id="out" position={Position.Right} style={{right: '1px'}}/>
      </div>
    </>
  );
};

export default TunnelOut;

interface TunnelOutModalProps {
  open: boolean;
  closeEditTunnelOut: () => void;
  initialValues: {
    netName: string;
    rotation: number;
  };
  onSubmit: (values: { netName: string; rotation: number; }) => void;
}

const TunnelOutModal: React.FC<TunnelOutModalProps> = ({open, closeEditTunnelOut, initialValues, onSubmit}) => {
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
      onCancel={closeEditTunnelOut}
      onOk={handleOk}
    >
      <Form form={form} name="TunnelOutConfiguration" initialValues={initialValues}>
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