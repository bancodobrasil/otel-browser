import { useState } from "react";
import styled from "styled-components";
import { OtelBrowser, OtelBrowserOptions  } from "otel-browser";

const options: OtelBrowserOptions = {
  urlCollector:"http://localhost:4318/v1/traces",
  serviceName: "reactjs-example",
  documentLoadIntrumentation: true,
  fetchInstrumentation: {
    enabled: true,
    propagateTraceHeaderCorsUrls: [
      "http://localhost:7001",
      "http://localhost:7002",
      "http://localhost:7003",
      "https://swapi.dev/api",
    ]
  }
}
const otelBrowser = new OtelBrowser(options);
const tracer = otelBrowser.getTracer("reactjs-calls")

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 0.5rem;
  gap: 10px;
`;

const Button = styled.button`
  
  font-size: 1rem;
`

const Stdout = styled.textarea`
  font-size: 1rem;
  min-height: 70vh;
`

const H1 = styled.h1`
  font-size: 1.5rem;
`;


export default function App() {
  const [output, setOutput] = useState("")
  const invokeService = (url: string) => {
    return () => {
      fetch(url)
      .then(response =>{
        return response.text();
      })
      .then(data =>{
        setOutput(output+'\r\n'+ data);
      })
    }
  }

  const invokeServiceTraced = (url: string) => {
    return () => {
      tracer.tracing("invoked-service-traced",
        fetch(url)
        .then(response =>{
          return response.text();
        })
        .then(data =>{
          setOutput(output+'\r\n'+ data);
        })
      );
    }
  }
  return (
    <Container>
      <H1>Test fetch endpoints:</H1>
      <Row>
        <Button onClick={invokeServiceTraced("http://localhost:7001/user/user1")}>Service 1</Button>
        <Button onClick={invokeService("http://localhost:7002/user/user1")}>Service 2</Button>
        <Button onClick={invokeService("http://localhost:7003/user/user1")}>Service 3</Button>
        <Button onClick={invokeService("https://swapi.dev/api/people/1")}>Star Wars API</Button>
      </Row>
      <Stdout readOnly value={output}/>
    </Container>
  );
}
