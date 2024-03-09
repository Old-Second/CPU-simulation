import {DownloadOutlined, SaveOutlined, UploadOutlined} from "@ant-design/icons";
import {Button, Form, Input, message, Modal, Space, Upload} from "antd";
import {useCallback, useEffect, useState} from "react";
import {Edge, Node, ReactFlowInstance, useReactFlow} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import {ChipDataState, DataState} from "../../type/Data.ts";
import FileSaver from "file-saver";

const selector = (state: {
  data: DataState;
  chipData: ChipDataState;
  setEdges: (edges: Edge[]) => void;
  setNodes: (nodes: Node[]) => void;
  setData: (data: DataState) => void;
  setChipData: (chipData: ChipDataState) => void;
}) => ({
  data: state.data,
  chipData: state.chipData,
  setEdges: state.setEdges,
  setNodes: state.setNodes,
  setData: state.setData,
  setChipData: state.setChipData,
});

const Save = ({rfInstance}: { rfInstance: ReactFlowInstance }) => {
  const {data, chipData, setNodes, setEdges, setData, setChipData} = useDataStore(selector);
  const {setViewport} = useReactFlow();
  
  // 保存数据到浏览器存储
  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem('Circuit', JSON.stringify(flow));
      localStorage.setItem('data', JSON.stringify(data));
      localStorage.setItem('chip-data', JSON.stringify(chipData));
    }
  }, [chipData, data, rfInstance]);
  
  // 下载数据
  const onDownload = useCallback((value: { name: string; }) => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      // localStorage.setItem('Circuit', JSON.stringify(flow));
      // localStorage.setItem('data', JSON.stringify(data));
      // localStorage.setItem('chip-data', JSON.stringify(chipData));
      
      // 将数据导出为JSON文件
      const jsonData = {flow, data, chipData};
      const jsonString = JSON.stringify(jsonData);
      const blob = new Blob([jsonString], {type: "application/json"});
      FileSaver.saveAs(blob, `${value.name}.json`);
    }
  }, [chipData, data, rfInstance]);
  
  // 从浏览器存储恢复数据
  const onRestore = useCallback(async () => {
    const restoreData = async () => {
      const dataString = localStorage.getItem('data');
      const chipDataString = localStorage.getItem('chip-data');
      if (dataString && chipDataString) {
        const data = JSON.parse(dataString);
        const chipData = JSON.parse(chipDataString);
        if (data && chipData) {
          try {
            setChipData(chipData || []);
            setData(data || {});
          } catch (error) {
            console.error("An error occurred while restoring data:", error);
          }
        }
      }
    };
    const restoreFlow = async () => {
      const CircuitString = localStorage.getItem('Circuit');
      if (CircuitString) {
        const Circuit = JSON.parse(CircuitString);
        if (Circuit) {
          const {x = 0, y = 0, zoom = 1} = Circuit.viewport;
          try {
            setNodes(Circuit.nodes || []);
            setEdges(Circuit.edges || []);
            setViewport({x, y, zoom});
          } catch (error) {
            console.error("An error occurred while restoring data:", error);
          }
        }
      }
    }
    
    await restoreData();
    await restoreFlow();
  }, [setChipData, setData, setEdges, setNodes, setViewport]);
  
  // 导入配置文件
  const onImport = useCallback(async (file: Blob) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonString = event.target?.result;
      const jsonData = JSON.parse(jsonString as string);
      const {flow, data, chipData} = jsonData;
      
      if (flow && data && chipData) {
        localStorage.setItem('Circuit', JSON.stringify(flow));
        localStorage.setItem('data', JSON.stringify(data));
        localStorage.setItem('chip-data', JSON.stringify(chipData));
        void onRestore();
      }
    };
    reader.readAsText(file);
  }, [onRestore]);
  
  // 组件挂载时执行保存操作
  useEffect(() => {
    onSave();
  }, [onSave]);
  // 组件挂载时执行恢复操作
  useEffect(() => {
    onRestore().then();
  }, [onRestore]);
  
  const [open, setOpen] = useState(false);
  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);
  const [form] = Form.useForm();
  
  const handleOk = () => {
    form
      .validateFields()
      .then((e) => {
        onDownload(e);
        closeModal();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };
  
  return (
    <>
      <Space>
        <Button type="primary" icon={<SaveOutlined/>} onClick={() => {
          onSave();
        }}>保存</Button>
        <Button type="primary" icon={<DownloadOutlined/>} onClick={() => {
          openModal();
        }}>导出</Button>
        <Upload name='file' accept='application/json' showUploadList={false}
                beforeUpload={(file) => {
                  if (!(file.type === 'application/json')) {
                    void message.error(`${file.name}格式错误`);
                    return false;
                  }
                  void onImport(file);
                  return false;
                }}>
          <Button type="primary" icon={<UploadOutlined/>}>导入</Button>
        </Upload>
        <Modal open={open} title={`导出配置`} okText="确定" cancelText="取消" onCancel={closeModal} onOk={handleOk}>
          <Form form={form} name="filename">
            <Form.Item name="name" label="配置名称" rules={[{required: true, message: '请输入配置名称!'}]}>
              <Input/>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </>
  )
};

export default Save;