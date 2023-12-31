import { Side, Board, DEFAULT_BOARD, oppositeOf, PieceType, isPromotable, Point, getSelectableMovePoints, getSelectablePutPoints, reversed, reverseBoardIfWhite } from "@/type"
import { useState } from "react";
import { ShougiImage } from "./shougiImage";
import { ShougiHand } from "./shougiHand";

interface Props {
  side?: Side,
  isGodMode?: boolean,
}

export const ShougiBoard = function ShougiBoard({
  side: defaultSide = "white",
  isGodMode = false,
}: Props) {
  const [currentSide, setCurrentSide] = useState<Side>(defaultSide);
  const [board, setBoard] = useState<Board>(DEFAULT_BOARD);
  const [movePoint, setMovePoint] = useState<Point | null>(null);
  const [putPiece, setPutPiece] = useState<{ side: Side, type: PieceType } | null>(null);
  const [promotePiece, setPromotePiece] = useState<{ side: Side, type: PieceType, to: Point } | null>();
  const squaresView = reverseBoardIfWhite(board.squares, currentSide);
  const moveSelectablePoints: Point[] = movePoint ? getSelectableMovePoints(movePoint, squaresView, currentSide) : [];
  const putSelectablePoints: Point[] = putPiece ? getSelectablePutPoints(putPiece.type, squaresView, currentSide) : [];

  const isEnemyTeritory = (side: Side, point: Point) => {
    return side === currentSide ? point.y <= 2 : point.y >= 6;
  }

  const put = (side: Side, type: PieceType, to: Point) => {
    const toSquare = squaresView[to.y][to.x];
    if (!toSquare) {
      const newHands = { ...board.hands }
      const index = board.hands[side].indexOf(type);
      newHands[side] = board.hands[side].filter((_, i) => i !== index);
      //駒打ち
      const newSquares = squaresView.map(row => row.slice());
      newSquares[to.y][to.x] = { piece: { type, promoted: false }, side }
      setBoard({ hands: newHands, squares: reverseBoardIfWhite(newSquares, currentSide) });
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
    const toSquare = squaresView[to.y][to.x];
    if (fromSquare) {
      if (toSquare) {
        if (toSquare.side !== fromSquare.side) {
          //駒取り
          const side = fromSquare.side;
          const newHands = { ...board.hands }
          newHands[side] = [...board.hands[side], toSquare.piece.type];
          //駒移動
          const newSquares = squaresView.map(row => row.slice());
          newSquares[to.y][to.x] = { ...fromSquare, piece: { ...fromSquare.piece, promoted: promote } };
          newSquares[from.y][from.x] = null;
          setBoard({ hands: newHands, squares: reverseBoardIfWhite(newSquares, currentSide) });
        }
        setMovePoint(null);
      } else {
        //駒移動
        const newSquares = squaresView.map(row => row.slice());
        newSquares[to.y][to.x] = { ...fromSquare, piece: { ...fromSquare.piece, promoted: promote } };
        newSquares[from.y][from.x] = null;
        setBoard(prev => ({ ...prev, squares: reverseBoardIfWhite(newSquares, currentSide) }));
        setMovePoint(null);
      }
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
                    return (
                      <td key={x}
                        className={[
                          "w-10 h-10 border border-black",
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
          onClick={()=>{
            setBoard(DEFAULT_BOARD);
          }}
          className="hover:cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
        />
      </div>
    </div>
  )
}