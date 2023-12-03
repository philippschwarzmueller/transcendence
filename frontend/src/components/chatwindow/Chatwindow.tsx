import React, { useState, useEffect, useContext, useRef } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { SocketContext } from "../../context/socket";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import { AuthContext, IUser } from "../../context/auth";
import Popup from "../popup/Popup";
import { IGameStart } from "../gamewindow/properties";
import { useNavigate } from "react-router-dom";
import { IMessage, ITab } from "./properties";
import ChannelUser from "../channeluser/ChannelUser";
import { BACKEND } from "../../routes/SetUser";

const Msgfield = styled.div`
  width: 320px;
  padding: 10px;
  border: none;
  margin: 0;
  background-color: rgb(195, 199, 203);
`;

const Tabbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0px;
  margin-bottom: 5px;
  border: none;
  max-width: 290px;
`;

const Textfield = styled.div`
  width: 334px;
  height: 200px;
  padding: 0px;
  margin: 0px;
  background-color: white;
  border-radius: 0px;
  border-width: 1px 0px 0px 1px;
  border-top-color: rgb(134, 138, 142);
  border-left-color: rgb(134, 138, 142);
  box-shadow:
    rgb(195, 199, 203) -1px -1px 0px 0px inset,
    rgb(0, 0, 0) 1px 1px 0px 0px inset,
    rgb(255, 255, 255) 0.5px 0.5px 0px 0.5px;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 17x;
    height: 17px;
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    box-sizing: border-box;
    display: inline-block;
    background: rgb(195, 199, 203);
    color: rgb(0, 0, 0);
    border: 0px;
    box-shadow:
      rgb(0, 0, 0) -1px -1px 0px 0px inset,
      rgb(210, 210, 210) 1px 1px 0px 0px inset,
      rgb(134, 138, 142) -2px -2px 0px 0px inset,
      rgb(255, 255, 255) 2px 2px 0px 0px inset;
  }
`;

const StyledLi = styled.li<{ $active: string }>`
  list-style: none;
  display: list-item;
  padding: 5px;
  font-size: 14px;
  border: solid 1px;
  border-top-color: white;
  border-left-color: white;
  border-top-left-radius: 5px 5px;
  border-top-right-radius: 5px 5px;
  cursor: pointer;
  max-width: 100%;
  background-color: ${(props) =>
    props.$active === "true" ? "rgb(195, 199, 203)" : "rgb(180, 180, 190)"};
  border-bottom-color: ${(props) =>
    props.$active === "true" ? "rgb(195, 199, 203)" : "black"};
`;

const StyledUl = styled.ul`
  padding: 5px;
  margin: 5px;
  list-style: none;
`;

const Chatwindow: React.FC<{ setDisplay?: (display: boolean) => void, $display: boolean, z?: number }> = ({
  $display,
  z,
  setDisplay,
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const user: IUser = useContext(AuthContext).user;
  const [tabs, setTabs] = useState<ITab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<number>(0);
  const [room, setRoom] = useState<ITab | null>(null);
  const [prevRoom, setPrevRoom] = useState<ITab | null>(null);
  const socket: Socket = useContext(SocketContext);
  const navigate = useNavigate();
  let listKey = 0;

  const msgField: any = useRef<HTMLCanvasElement | null>(null);
  const roomRef: any = useRef<typeof Popup | null>(null);
  const channelRef: any = useRef<typeof ChannelUser | null>(null);

  const fetchChannels = () => {
    fetch(`${BACKEND}/chat?userId=${user.intraname}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((res: ITab[]) => setTabs(res))
      .catch((error) => console.error(error));
  }

  socket.on("message", (res: IMessage) => setMessages([...messages, res]));
  socket.on("invite", (res: ITab[]) => setTabs(res));
  socket.on("game", (body: IGameStart) => {
    navigate(`/play/${body.gameId}/${body.side}`);
  });

  useEffect(() => {
    fetchChannels();
    if (tabs.length > 0) setRoom(tabs[tabs.length - 1]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (room) {
      socket.emit(
        "join",
        {
          user: user,
          type: 0,
          id: room?.id,
          title: room?.title,
          prev: prevRoom?.id,
        },
        (res: IMessage[]) => setMessages(res),
      );
    }
  }, [room]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () =>
      msgField.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      }),
    [messages],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTabs(tabs);
    if (tabs.length > 0)
      setActive(tabs[tabs.length - 1]);
    else
      setMessages([]);
  }, [tabs]); // eslint-disable-line react-hooks/exhaustive-deps

  function send(event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault();
    if (input.trim() !== "" && user !== undefined)
      socket.emit("message", { user, input, room: room?.id });
    setInput("");
  }

  const setActive = (tab: ITab) => {
    setActiveTab(tab.title);
    setActiveTabId(tab.id);
    setPrevRoom(room);
    setRoom(tab);
  };

  return (
    <>
      <Popup
        placeholder="type room name here"
        user={user}
        ref={roomRef}
        setTabs={setTabs}
      />
      <ChannelUser
        id={activeTabId}
        ref={channelRef}
      /> <Moveablewindow title="Chat"
        positionX={200}
        positionY={200}
        positionZ={z}
        display={$display}
        setDisplay={setDisplay}
      >
        <Tabbar>
          {tabs.map((tab) => {
            return (
              <StyledLi
                onClick={(e: React.MouseEvent) => {setActive(tab);
                if (tab.title === activeTab) { channelRef.current.openBrowser(e);
                }}}
                key={tab.title}
                $active={tab.title === activeTab ? "true" : "false"}
              >
                {tab.title}
              </StyledLi>
            );
          })}
          <StyledLi
            key="+"
            $active={"false"}
            onClick={(e: React.MouseEvent) => roomRef.current.openRoom(e)}
          >
            +
          </StyledLi>
          <Button
            onClick={() => {
              socket.emit("leave", {user: user.intraname, chat: activeTabId}, () => {
                setTabs(
                  tabs.filter(function (e) {
                  return e.title !== activeTab;
                }),
              );
              if (tabs.length > 0) setActive(tabs[tabs.length - 1]);
              })}}
              $position="absolute"
              $top="35px"
              $right="20px"
          >
            Leave
          </Button>
        </Tabbar>
        <Textfield>
          <StyledUl ref={msgField} id="msgField">
            {messages.map((mes) => {
              if (mes.block.filter((m) => m === user.intraname).length === 0)
                return <li key={listKey++}>{mes.message}</li>;
              return <></>; //maybe lint fix
            })}
          </StyledUl>
        </Textfield>
        <Msgfield>
          <Input
            value={input}
            label="Type here"
            placeholder="Enter message"
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") send(e);
            }}
          ></Input>
        </Msgfield>
      </Moveablewindow>
    </>
  );
};

export default Chatwindow;
