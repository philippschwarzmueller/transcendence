import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

type CommonStyledProps = {};

type ProgressBarProps = {
  hideValue?: boolean;
  totalTime: number;
} & React.HTMLAttributes<HTMLDivElement> &
  CommonStyledProps;

const blockSizes = {
  md: "32px",
};

const Wrapper = styled.div`
  display: inline-block;
  height: ${blockSizes.md};
  width: 100%;
`;

const StyledScrollView = styled.div``;

const ProgressCutout = styled(StyledScrollView)`
  width: 100%;
  height: 100%;
  position: relative;
  text-align: center;
  padding: 0;
  overflow: hidden;
  &:before {
    z-index: 1;
  }
`;

const TilesWrapper = styled.div`
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  position: absolute;
  left: 3px;
  top: 4px;
  display: inline-flex;
  border-top: 2px solid grey;
  border-left: 2px solid grey;
  border-bottom: 2px solid white;
  border-right: 2px solid white;
  padding: 2px;
`;

const tileWidth = 17;

const Tile = styled.span`
  display: inline-block;
  width: ${tileWidth}px;
  box-sizing: border-box;
  height: 100%;
  background: rgb(19, 42, 122);
  border-color: rgb(195, 199, 203);
  border-width: 0px 1px;
  border-style: solid;
`;

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ totalTime, ...otherProps }, ref) => {
    const [progress, setProgress] = useState(0);

    const tilesWrapperRef = useRef<HTMLDivElement | null>(null);
    const [tiles, setTiles] = useState([]);

    const updateTilesNumber = useCallback(() => {
      if (!tilesWrapperRef.current || progress === undefined) {
        return;
      }

      const progressWidth =
        tilesWrapperRef.current.getBoundingClientRect().width;
      const newTilesNumber = Math.round(
        ((progress / 100) * progressWidth) / tileWidth - 1
      );

      // Ensure the last tile is not rendered when progress is 100%
      const adjustedTiles =
        newTilesNumber === 100 ? newTilesNumber - 1 : newTilesNumber;

      setTiles(Array.from({ length: adjustedTiles }));
    }, [progress]);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prevProgress) =>
          prevProgress < 100 ? prevProgress + 1 : 100
        );
      }, totalTime * 10);

      return () => clearInterval(interval);
    }, [totalTime]);

    useEffect(() => {
      updateTilesNumber();

      window.addEventListener("resize", updateTilesNumber);
      return () => window.removeEventListener("resize", updateTilesNumber);
    }, [updateTilesNumber]);

    return (
      <Wrapper ref={ref} {...otherProps}>
        <ProgressCutout>
          <TilesWrapper ref={tilesWrapperRef}>
            {tiles.map((_, index) => (
              <Tile key={index} />
            ))}
          </TilesWrapper>
        </ProgressCutout>
      </Wrapper>
    );
  }
);

export default ProgressBar;
