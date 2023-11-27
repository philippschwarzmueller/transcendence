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

const GraphContainer = styled.div<{ $display?: boolean }>`
  width: 100%;
  max-width: 500px;
  max-height: 300px;
  margin: auto;
  overflow: hidden;
  display: ${(props) => (props.$display ? "" : "none")};
`;

const Win98Box = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgb(195, 199, 203);
  cursor: pointer;
  height: 100%;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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

interface IData {
  index: number;
  value: number;
}

const GraphComponent: React.FC<{ intraname: string; display?: boolean }> = ({
  intraname,
  display,
}) => {
  const [eloValues, setEloValues] = useState<number[]>([]);
  const [data, setData] = useState<IData[]>([]);
  const [domainMin, setDomainMin] = useState<number>(900);
  const [domainMax, setDomainMax] = useState<number>(1100);
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

    if (intraname)
      fetchData()
        .then(() => {
          eloValues.map((value, index) => ({
            index: index + 1,
            value: value,
          }));
          setData(
            eloValues.map((value, index) => ({
              index: index + 1,
              value: value,
            }))
          );
        })
        .then(() => {
          setDomainMin(Math.floor(Math.min(...eloValues) / 100 - 0.5) * 100);
          setDomainMax(Math.ceil(Math.max(...eloValues) / 100 + 0.5) * 100);
        });
  }, [intraname]); // eslint-disable-line react-hooks/exhaustive-deps

  const ticks = Array.from(
    { length: (domainMax - domainMin) / 100 + 1 },
    (_, i) => domainMin + i * 100
  );

  return (
    <GraphContainer $display={display}>
      <Win98Box>
        <ContentContainer>
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
