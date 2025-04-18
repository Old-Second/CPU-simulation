import './index.css'
import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import useDataStore from "../../../store/useDataStore.ts";
import React, {useCallback, useEffect, useState} from "react";
import {Form, Input, InputNumber, message, Modal, Table} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../../utils/selector.ts";

const {Column} = Table;


const Rom = ({preview = false}: { preview?: boolean }) => {
  const {edges, data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [romInput, setRomInput] = useState({A: 0, sel: 0});
  const [romData, setRomData] = useState<{
    dataBits: number;
    addressBits: number;
    label: string,
    dataSource: { [address: string]: number; }
  }>({addressBits: 1, dataBits: 1, label: "ROM", dataSource: {}});

  useEffect(() => {
    setRomData((getChipData(nodeId) ?? getChipData('rom')) as {
      dataBits: number;
      addressBits: number;
      label: string,
      dataSource: { [address: string]: number; }
    });
  }, [chipData, getChipData, nodeId]);

  // 当数据或节点 ID 更改时更新 A 和 sel
  useEffect(() => {
    setRomInput({
      A: getData(nodeId, 'A'),
      sel: getData(nodeId, 'sel')
    })
  }, [data, getData, nodeId]);

  // 当 A 或数据源更改时更新 D
  useEffect(() => {
    const {A, sel} = romInput;
    if (sel === 1) {
      updateData(nodeId, 'D', romData.dataSource[A])
    }
  }, [edges, romInput, nodeId, romData, updateData]);

  const [open, setOpen] = useState(false);
  const openEditRom = () => setOpen(true);
  const closeEditRom = () => setOpen(false);

  // 处理表单提交
  const handleSubmit = (data: {
    dataBits: number;
    addressBits: number;
    label: string;
    dataSource: { [address: string]: number; }
  }) => {
    setRomData(data);
    updateChipData(nodeId, data);
    void message.success('配置成功');
    closeEditRom();
  }

  if (preview) {
    return (
      <div className="rom">
        <p className={'rom-port rom-A'}>A</p>
        <p className={'rom-port rom-sel'}>sel</p>
        <p className={'rom-port rom-D'}>D</p>
      </div>
    )
  }

  return (
    <>
      <h3>{romData.label}</h3>
      <div className="rom">
        {/* 节点端口 */}
        <p className={'rom-port rom-A'}>A</p>
        <p className={'rom-port rom-sel'}>sel</p>
        <p className={'rom-port rom-D'}>D</p>

        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditRom}/>
          <RomModal open={open} closeEditRom={closeEditRom} onSubmit={handleSubmit} initialValues={romData}/>
        </NodeToolbar>

        <Handle type='target' id="A" position={Position.Left} style={{top: '33%'}}/>
        <Handle type='target' id="sel" position={Position.Left} style={{top: '66%'}}/>
        <Handle type='source' id="D" position={Position.Right}/>
      </div>
    </>
  );
}

export default Rom;

interface RomModalProps {
  open: boolean;
  closeEditRom: () => void;
  initialValues: {
    label: string;
    dataBits: number;
    addressBits: number;
    dataSource: { [address: string]: number; }
  };
  onSubmit: (data: {
    dataBits: number;
    addressBits: number;
    label: string;
    dataSource: { [address: string]: number; }
  }) => void;
}

const RomModal: React.FC<RomModalProps> = ({open, closeEditRom, initialValues, onSubmit}) => {
  const [form] = Form.useForm();
  const [dataBits, setDataBits] = useState<number>(initialValues.dataBits);
  const [dataSource, setDataSource] = React.useState<Array<{
    key: number;
    address: string;
    value: string
  }>>(Object.entries(initialValues.dataSource).map(([address, value], index) => ({
      key: index,
      address: address.toString(),
      value: value.toString()
    }))
  );

  // 安全的十六进制转换函数
  const safeHexParse = useCallback((value: string): number => {
    try {
      // 移除可能的0x前缀
      const cleanValue = value.replace(/^0x/i, '');
      // 尝试解析十六进制
      const parsed = parseInt(cleanValue, 16);
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  }, []);

  // 安全的十六进制格式化函数
  const formatHex = useCallback((value: number): string => {
    try {
      // 始终以十六进制格式显示
      return `0x${value.toString(16).toUpperCase()}`;
    } catch {
      return '0x0';
    }
  }, []);

  // 生成数据源
  const generateDataSource = useCallback((addressBits: number) => {
    try {
      const rowCount = Math.pow(2, addressBits);

      const newData = Array.from({length: rowCount}, (_, i) => {
        const address = i > 9 ? `0x${i.toString(16).toUpperCase()}` : i.toString();
        let value = '0x0';
        
        if (initialValues.dataSource[i] !== undefined) {
          // 直接使用十进制值，但在显示时转换为十六进制
          const decimalValue = initialValues.dataSource[i];
          value = formatHex(decimalValue);
        }
        
        return {
          key: i,
          address,
          value
        };
      });
      
      setDataSource(newData);
    } catch (error) {
      console.error('生成数据源时出错:', error);
      void message.error('生成数据源失败');
    }
  }, [initialValues.dataBits, initialValues.dataSource, formatHex]);

  useEffect(() => {
    generateDataSource(initialValues.addressBits);
  }, [generateDataSource, initialValues.addressBits]);

  // 处理表单提交
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        try {
          const decimalDataSource = dataSource.reduce((acc, item) => {
            // 将十六进制字符串转换为十进制数值
            acc[item.key] = safeHexParse(item.value);
            return acc;
          }, {} as { [address: string]: number });
          
          onSubmit({...values, dataSource: decimalDataSource});
        } catch (error) {
          console.error('处理表单数据时出错:', error);
          void message.error('提交失败');
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const inputDataSource = useCallback((newValue: string, index: number) => {
    try {
      const newData = [...dataSource];
      const maxValue = Math.pow(2, dataBits) - 1;
      
      // 确保输入值包含0x前缀
      const valueWithPrefix = newValue.startsWith('0x') ? newValue : `0x${newValue}`;
      const parsedValue = safeHexParse(valueWithPrefix);
      
      newData[index].value = formatHex(Math.min(parsedValue, maxValue));
      setDataSource(newData);
    } catch (error) {
      console.error('更新数据源时出错:', error);
      void message.error('更新失败');
    }
  }, [dataBits, dataSource, safeHexParse, formatHex]);

  return (
    <Modal
      open={open}
      title={`${initialValues.label} 配置`}
      okText="确定"
      cancelText="取消"
      onCancel={closeEditRom}
      onOk={handleOk}
    >
      <Form form={form} name="RomConfiguration" initialValues={initialValues}>
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
          <InputNumber min={1} max={32} onChange={value => generateDataSource(value as number)}/>
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
        <Column
          title="Value"
          dataIndex="value"
          key="value"
          render={(text, _record, index) => (
            <Input
              value={text}
              onChange={(e) => {
                inputDataSource(e.target.value.toUpperCase(), index)
              }}
              placeholder="十六进制格式，如0x1F"
            />
          )}
        />
      </Table>
    </Modal>
  );
};