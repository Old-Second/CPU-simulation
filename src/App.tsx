import './App.css'
import CircuitDiagram from "./Components/CircuitDesigner/CircuitDesigner.tsx";
import Sidebar from "./Components/Sidebar/Sidebar.tsx";
import {Layout} from "antd";
import {ReactFlowProvider} from "reactflow";
import Login from "./Components/Login/Login.tsx";

const {Content} = Layout;


function App() {
  
  return (
    <Layout>
      <Sidebar/>
      <Content>
        <ReactFlowProvider>
          <CircuitDiagram/>
        </ReactFlowProvider>
      </Content>
      <Login/>
    </Layout>
  )
}

export default App;