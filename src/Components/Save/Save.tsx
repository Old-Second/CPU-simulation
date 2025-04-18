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
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
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
  const MAX_RETRY_COUNT = 3;
  const RETRY_DELAY = 1000;

  // 检查本地存储容量
  const checkStorageCapacity = useCallback(() => {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  // 保存数据到浏览器存储
  const onSave = useCallback(async () => {
    if (!rfInstance) return;

    let retryCount = 0;
    while (retryCount < MAX_RETRY_COUNT) {
      try {
        if (!checkStorageCapacity()) {
          throw new Error('本地存储空间不足');
        }

        const flow = rfInstance.toObject();
        const flowString = JSON.stringify(flow);
        const dataString = JSON.stringify(data);
        const chipDataString = JSON.stringify(chipData);

        // 检查数据大小
        const totalSize = flowString.length + dataString.length + chipDataString.length;
        if (totalSize > 5 * 1024 * 1024) { // 5MB限制
          throw new Error('数据大小超过限制');
        }

        localStorage.setItem('Circuit', flowString);
        localStorage.setItem('data', dataString);
        localStorage.setItem('chip-data', chipDataString);
        
        void message.success('保存成功');
        return;
      } catch (e) {
        retryCount++;
        console.warn(`保存尝试 ${retryCount}/${MAX_RETRY_COUNT} 失败:`, e);
        
        if (retryCount === MAX_RETRY_COUNT) {
          void message.error(e instanceof Error ? e.message : '保存失败');
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }, [chipData, data, rfInstance, checkStorageCapacity]);

  // 下载数据
  const onDownload = useCallback(async (value: { name: string; }) => {
    if (!rfInstance) return;

    try {
      const flow = rfInstance.toObject();
      // localStorage.setItem('Circuit', JSON.stringify(flow));
      // localStorage.setItem('data', JSON.stringify(data));
      // localStorage.setItem('chip-data', JSON.stringify(chipData));

      // 将数据导出为JSON文件
      const jsonData = {flow, data, chipData};
      const jsonString = JSON.stringify(jsonData);
      
      // 检查数据大小
      if (jsonString.length > 10 * 1024 * 1024) { // 10MB限制
        throw new Error('导出数据大小超过限制');
      }
      
      const blob = new Blob([jsonString], {type: "application/json"});
      FileSaver.saveAs(blob, `${value.name}.json`);
      void message.success('导出成功');
    } catch (e) {
      console.error('导出失败:', e);
      void message.error(e instanceof Error ? e.message : '导出失败');
    }
  }, [chipData, data, rfInstance]);

  // 从浏览器存储恢复数据
  const onRestore = useCallback(async () => {
    let retryCount = 0;
    while (retryCount < MAX_RETRY_COUNT) {
      try {
        const dataString = localStorage.getItem('data');
        const chipDataString = localStorage.getItem('chip-data');
        const CircuitString = localStorage.getItem('Circuit');

        if (!dataString || !chipDataString || !CircuitString) {
          throw new Error('未找到保存的数据');
        }

        const data = JSON.parse(dataString);
        const chipData = JSON.parse(chipDataString);
        const Circuit = JSON.parse(CircuitString);

        if (!data || !chipData || !Circuit) {
          throw new Error('数据格式错误');
        }

        setChipData(chipData);
        setData(data);
        setNodes(Circuit.nodes || []);
        setEdges(Circuit.edges || []);
        
        const {x = 0, y = 0, zoom = 1} = Circuit.viewport;
        setViewport({x, y, zoom});
        
        return;
      } catch (e) {
        retryCount++;
        console.error(`恢复数据尝试 ${retryCount}/${MAX_RETRY_COUNT} 失败:`, e);
        
        if (retryCount === MAX_RETRY_COUNT) {
          void message.error(e instanceof Error ? e.message : '恢复数据失败');
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
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
  }, []);
  // 组件挂载时执行恢复操作
  useEffect(() => {
    onRestore().then();
  }, []);

  const [open, setOpen] = useState(false);
  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((e) => {
        onDownload(e).then(() => {
          void message.success('导出成功');
        });
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
                  onImport(file).then(() => {
                    void message.success(`${file.name}导入成功`);
                  });
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