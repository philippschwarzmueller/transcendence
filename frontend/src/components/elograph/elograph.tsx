import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { BACKEND } from "../../routes/SetUser";

const GraphContainer = styled.div`
  width: 100%;
  max-width: 500px;
  max-height: 300px;
  margin: auto;
  overflow: hidden;
`;

const Win98Box = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgb(195, 199, 203);
  box-shadow: inset 1px 1px 0px 1px rgb(255, 255, 255),
    inset 0 0 0 1px rgb(134, 138, 142), 1px 1px 0px 1px rgb(0, 0, 0),
    2px 2px 5px 0px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  height: 100%;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Title = styled.div`
  background-color: #5a7b8c;
  color: white;
  padding: 5px;
  font-weight: bold;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  width: 96.5%;
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 1px 0px 1px;
  margin-bottom: 10px;
`;

const CustomTooltipContainer = styled.div`
  background: white;
  padding: 0px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const eloValue = payload[0].value;

    return (
      <CustomTooltipContainer>
        <p>Elo: {eloValue}</p>
      </CustomTooltipContainer>
    );
  }

  return null;
};

const GraphComponent: React.FC<{ intraname: string }> = ({ intraname }) => {
  const [eloValues, setEloValues] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND}/games/getallelo/${intraname}`);
        const data = await response.json();
        setEloValues(data);
      } catch (error) {
        console.error("Error fetching Elo values:", error);
      }
    };

    fetchData();
  }, [intraname]);

  const data = eloValues.map((value, index) => ({
    index: index + 1,
    elo: value,
  }));

  const domainMin = Math.floor(Math.min(...eloValues) / 100 - 0.5) * 100;
  const domainMax = Math.ceil(Math.max(...eloValues) / 100 + 0.5) * 100;

  const ticks = Array.from(
    { length: (domainMax - domainMin) / 100 + 1 },
    (_, i) => domainMin + i * 100
  );

  return (
    <GraphContainer>
      <Win98Box>
        <ContentContainer>
          <Title>Elo History</Title>
          <LineChart width={500} height={300} data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="index" tick={false} />
            <YAxis domain={[domainMin, domainMax]} ticks={ticks} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="elo" stroke="#000080" />
          </LineChart>
        </ContentContainer>
      </Win98Box>
    </GraphContainer>
  );
};

export default GraphComponent;
