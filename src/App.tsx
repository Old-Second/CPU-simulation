import './App.css'
import CircuitDiagram from "./Components/CircuitDesigner/CircuitDesigner.tsx";
import Sidebar from "./Components/Sidebar/Sidebar.tsx";
import {Layout} from "antd";
import {ReactFlowProvider} from "reactflow";
import Login from "./Components/Login/Login.tsx";
import About from "./Components/About/About.tsx";

const {Content} = Layout;


function App() {

  return (
    <Layout>
      <ReactFlowProvider>
        <Sidebar/>
        <Content>
          {/*<ReactFlowProvider>*/}
          <CircuitDiagram/>
          {/*</ReactFlowProvider>*/}
        </Content>
      </ReactFlowProvider>
      <About/>
      <Login/>
    </Layout>
  )
}

export default App;