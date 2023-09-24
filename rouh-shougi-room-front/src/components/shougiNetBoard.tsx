import { Side, Board, DEFAULT_BOARD, oppositeOf, PieceType, isPromotable, Point, getSelectableMovePoints, getSelectablePutPoints, reversed, reverseBoardIfWhite, Move, reversePointIfWhite } from "@/type"
import { useState } from "react";
import { ShougiImage } from "./shougiImage";
import { ShougiHand } from "./shougiHand";

interface Props {
  side?: Side,
  isGodMode?: boolean,
  board: Board,
  onMove: (move: Move) => void,
  onReset: () => void,
  lastMovePoint?: Point,
}

export const ShougiNetBoard = function ShougiNetBoard({
  side: defaultSide = "white",
  isGodMode = false,
  board,
  onMove,
  onReset,
  lastMovePoint,
}: Props) {
  const [currentSide, setCurrentSide] = useState<Side>(defaultSide);
  const [movePoint, setMovePoint] = useState<Point | null>(null);
  const [putPiece, setPutPiece] = useState<{ side: Side, type: PieceType } | null>(null);
  const [promotePiece, setPromotePiece] = useState<{ side: Side, type: PieceType, to: Point } | null>();
  const squaresView = reverseBoardIfWhite(board.squares, currentSide);
  const lastMovePointView = lastMovePoint? reversePointIfWhite(lastMovePoint, currentSide): undefined;
  const moveSelectablePoints: Point[] = movePoint ? getSelectableMovePoints(movePoint, squaresView, currentSide) : [];
  const putSelectablePoints: Point[] = putPiece ? getSelectablePutPoints(putPiece.type, squaresView, currentSide) : [];

  const isEnemyTeritory = (side: Side, point: Point) => {
    return side === currentSide ? point.y <= 2 : point.y >= 6;
  }

  const put = (side: Side, type: PieceType, to: Point) => {
    const toSquare = squaresView[to.y][to.x];
    if (!toSquare) {
      onMove({
        side: currentSide,
        from: undefined,
        to: reversePointIfWhite(to, side),
        piece: {
          type: type,
          promoted: false,
        },
      })
    }
    setPutPiece(null);
  }

  const move = (from: Point, to: Point) => {
    const fromSquare = squaresView[from.y][from.x];
    if (fromSquare) {
      const promotable = isPromotable(fromSquare.piece.type) && !fromSquare.piece.promoted &&
        (isEnemyTeritory(fromSquare.side, from) || isEnemyTeritory(fromSquare.side, to));
      if (promotable) {
        //モーダルを表示して成/不成を選択
        setPromotePiece({ side: fromSquare.side, type: fromSquare.piece.type, to });
      } else {
        doMove(from, to, fromSquare.piece.promoted);
      }
    }
  }

  const doMove = (from: Point, to: Point, promote: boolean) => {
    const fromSquare = squaresView[from.y][from.x];
    if (fromSquare) {
      onMove({
        side: currentSide,
        from: reversePointIfWhite(from, fromSquare.side),
        to: reversePointIfWhite(to, fromSquare.side),
        piece: {
          type: fromSquare.piece.type,
          promoted: promote,
        }
      })
      setMovePoint(null);
    }
  }

  return (
    <div className="space-y-1 w-fit">
      <ShougiHand
        hand={board.hands[oppositeOf(currentSide)]}
        isEnemy={true}
        selectedPiece={putPiece?.side === oppositeOf(currentSide) ? putPiece?.type : undefined}
        handlePieceClick={type => {
          setMovePoint(null);
          if (isGodMode) {
            setPutPiece({ side: oppositeOf(currentSide), type });
          }
        }}
      />

      <div className="relative">
        {movePoint && promotePiece &&
          <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center"
            onClick={() => {
              setPromotePiece(null);
              setMovePoint(null);
            }}>
            <div className="bg-white relative p-2">
              <div className="flex gap-x-1">
                <div className="border border-black hover:bg-[#f08080]"
                  onClick={() => {
                    doMove(movePoint, promotePiece.to, true);
                  }}>
                  <div className="w-10 h-10 m-2">
                    <ShougiImage piece={{ type: promotePiece.type, promoted: true }} />
                  </div>
                </div>
                <div className="border border-black hover:bg-[#f08080]"
                  onClick={() => {
                    doMove(movePoint, promotePiece.to, false);
                  }}>
                  <div className="w-10 h-10 m-2">
                    <ShougiImage piece={{ type: promotePiece.type, promoted: false }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        <table className="bg-[#fcebca]">
          <tbody>
            {Array.from(Array(9).keys()).map((y) => {
              return (
                <tr key={y}>
                  {Array.from(Array(9).keys()).map((x) => {
                    const square = squaresView[y][x];
                    const isSelected = movePoint && movePoint.y === y && movePoint.x === x;
                    const isMoveSeletable = moveSelectablePoints.some(p => p.x === x && p.y === y);
                    const isPutSelectable = putSelectablePoints.some(p => p.x === x && p.y === y);
                    const isLastMoved = lastMovePointView && lastMovePointView.y === y && lastMovePointView.x === x;
                    return (
                      <td key={x}
                        className={[
                          "w-10 h-10 border border-black",
                          isLastMoved? "bg-[#f08080]": "",
                          isSelected ? "bg-[#f08080]" : "",
                          isMoveSeletable ? "bg-[#f0e4a8]" : "",
                          isPutSelectable ? "bg-[#f0e4a8]" : "",
                        ].join(" ")}
                        onClick={() => {
                          const isEmpty = !square;
                          if (movePoint) {
                            if (isSelected) {
                              // cancel move mode
                              setMovePoint(null);
                            } else if (isMoveSeletable) {
                              move(movePoint, { x, y });
                            } else {
                              if (!isEmpty && (isGodMode || square.side === currentSide)) {
                                // to move mode
                                setPutPiece(null);
                                setMovePoint({ x, y });
                              } else {
                                // cancel move mode
                                setMovePoint(null);
                              }
                            }
                          } else {
                            if (putPiece && isEmpty && isPutSelectable) {
                              put(putPiece.side, putPiece.type, { x, y });
                            }
                            if (!isEmpty && (isGodMode || square.side === currentSide)) {
                              // to move mode
                              setPutPiece(null);
                              setMovePoint({ x, y });
                            }
                          }
                        }}>
                        {square &&
                          <ShougiImage piece={square.piece} reversed={currentSide !== square.side} />
                        }
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ShougiHand
        hand={board.hands[currentSide]}
        isEnemy={false}
        selectedPiece={putPiece?.side === currentSide ? putPiece?.type : undefined}
        handlePieceClick={type => {
          setMovePoint(null);
          setPutPiece({ side: currentSide, type });
        }}
      />
      <div className="flex gap-1 items-center">
        <div>{currentSide==="black"?"先手":"後手"}</div>
        <input type="button"
          value="席を移動"
          onClick={()=>{
            setCurrentSide(prev=>oppositeOf(prev));
          }}
          className="hover:cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
        />
        <input type="button"
          value="盤面リセット"
          onClick={onReset}
          className="hover:cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
        />
      </div>
    </div>
  )
}