import { Board, DEFAULT_BOARD, Move, Point } from "@/type";
import { useEffect, useState } from "react";
import { ShougiNetBoard } from "./shougiNetBoard";

interface Props {
  websocketUrl: string,
}

export const ShougiNet = function ShougiNet({
  websocketUrl,
}: Props) {
  const [connection, setConnection] = useState<WebSocket>();
  const [board, setBoard] = useState<Board>(DEFAULT_BOARD);
  const [lastMovePoint, setLastMovePoint] = useState<Point>();

  if(connection){
    connection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data && data.action){
        if(data.action==="move"){
          onMove(data.move);
        }else if(data.action==="reset"){
          onReset();
        }else if(data.action==="sync"){
          const board = data.board;
          setBoard(board);
        }else if(data.action==="arrived"){
          sendBoard(board);
        }
      }
    };
    connection.onopen = () => {
      connection.send(
        JSON.stringify({
          action: "sendmessage",
          message: JSON.stringify({
            action: "arrived",
          })
        })
      );
    }
  }

  const sendReset = () => {
    if(connection){
      connection.send(
        JSON.stringify({
          action: "sendmessage",
          message: JSON.stringify({
            action: "reset",
          }),
        })
      );
    }
  }

  const sendBoard = (board: Board) => {
    if(connection && connection.readyState){
      connection.send(JSON.stringify({
        action: "sendmessage",
        message: JSON.stringify({
          action: "sync",
          board: board,
        })
      }))
    }
  }

  const sendMove = (move: Move)=> {
    if(connection){
      connection.send(JSON.stringify({
        action: "sendmessage",
        message: JSON.stringify({
          action: "move",
          move: move,
        }),
      }));
    }
  }

  useEffect(() => {
    const socket = new WebSocket(websocketUrl);
    setConnection(socket);
    return () => {
      socket.close();
    }
  }, [])

  const onMove = (move: Move) => {
    const toSquare = board.squares[move.to.y][move.to.x];
    if (move.from) {
      //駒移動
      const fromSquare = board.squares[move.from.y][move.from.x];
      if (fromSquare) {
        if (toSquare) {
          if (toSquare.side !== fromSquare.side) {
            //駒取り
            const side = fromSquare.side;
            const newHands = { ...board.hands }
            newHands[side] = [...board.hands[side], toSquare.piece.type];
            //駒移動
            const newSquares = board.squares.map(row => row.slice());
            newSquares[move.to.y][move.to.x] = { ...fromSquare, piece: move.piece };
            newSquares[move.from.y][move.from.x] = null;
            setBoard({ hands: newHands, squares: newSquares });
            setLastMovePoint(move.to);
          }
        } else {
          //駒移動
          const newSquares = board.squares.map(row => row.slice());
          newSquares[move.to.y][move.to.x] = { ...fromSquare, piece: move.piece };
          newSquares[move.from.y][move.from.x] = null;
          setBoard({ ...board, squares: newSquares });
          setLastMovePoint(move.to);
        }
      }
    } else {
      //駒打ち
      if (!toSquare) {
        const newHands = { ...board.hands }
        const index = board.hands[move.side].indexOf(move.piece.type);
        newHands[move.side] = board.hands[move.side].filter((_, i) => i !== index);
        //駒打ち
        const newSquares = board.squares.map(row => row.slice());
        newSquares[move.to.y][move.to.x] = { piece: move.piece, side: move.side }
        setBoard({ hands: newHands, squares: newSquares });
        setLastMovePoint(move.to);
      }
    }

  }

  const onReset = () => {
    setBoard(DEFAULT_BOARD);
    setLastMovePoint(undefined);
  }

  return (
    <div>
      <ShougiNetBoard
        board={board}
        onMove={move=>{
          sendMove(move);
          onMove(move);
        }}
        onReset={()=>{
          if(window.confirm("盤面をリセットしてよろしいですか？")){
            sendReset();
            onReset(); 
          }
        }}
        lastMovePoint={lastMovePoint}/>
    </div>
  )
}