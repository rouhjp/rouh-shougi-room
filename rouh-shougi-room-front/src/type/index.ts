
export const PIECE_TYPES = ["king", "rook", "bishop", "gold", "silver", "knight", "lance", "pawn"];
export type PieceType = typeof PIECE_TYPES[number];

export const comparePieceType = (a: PieceType, b: PieceType): number =>
  PIECE_TYPES.indexOf(a) - PIECE_TYPES.indexOf(b);

export const sortPieceTypes = (pieceTypes: PieceType[]): PieceType[] =>
  [...pieceTypes].sort(comparePieceType);

export const PAWN: Piece = { type: "pawn", promoted: false }
export const SILVER: Piece = { type: "silver", promoted: false }
export const GOLD: Piece = { type: "gold", promoted: false }
export const KNIGHT: Piece = { type: "knight", promoted: false }
export const LANCE: Piece = { type: "lance", promoted: false }
export const ROOK: Piece = { type: "rook", promoted: false }
export const BISHOP: Piece = { type: "bishop", promoted: false }
export const KING: Piece = { type: "king", promoted: false }
export const PROMOTED_PAWN: Piece = { type: "pawn", promoted: true }
export const PROMOTED_SILVER: Piece = { type: "silver", promoted: true }
export const PROMOTED_KNIGHT: Piece = { type: "knight", promoted: true }
export const PROMOTED_LANCE: Piece = { type: "lance", promoted: true }
export const PROMTOED_ROOK: Piece = { type: "rook", promoted: true }
export const PROMTOED_BISHOP: Piece = { type: "bishop", promoted: true }

const PROMOTABLE_PIECE_TYPES: PieceType[] = ["pawn", "silver", "knight", "lance", "rook", "bishop"];
export const isPromotable = (type: PieceType): boolean =>
  PROMOTABLE_PIECE_TYPES.includes(type);

export type Piece = {
  type: PieceType,
  promoted: boolean,
}

// 黒...先手、白...後手
export type Side = "black" | "white"
export const oppositeOf = (side: Side) =>
  side === "black" ? "white" : "black";

export type Square = {
  piece: Piece,
  side: Side,
}

export type Squares = (Square | null)[][]

export type Board = {
  squares: Squares,
  hands: {
    black: PieceType[],
    white: PieceType[],
  }
}

export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 9;

const generateDefaultBoard = (): Squares => {
  let board: Squares = new Array(BOARD_HEIGHT).fill(null).map(() => new Array(BOARD_WIDTH).fill(null));
  board[0][0] = { piece: LANCE, side: "white" }
  board[0][1] = { piece: KNIGHT, side: "white" }
  board[0][2] = { piece: SILVER, side: "white" }
  board[0][3] = { piece: GOLD, side: "white" }
  board[0][4] = { piece: KING, side: "white" }
  board[0][5] = { piece: GOLD, side: "white" }
  board[0][6] = { piece: SILVER, side: "white" }
  board[0][7] = { piece: KNIGHT, side: "white" }
  board[0][8] = { piece: LANCE, side: "white" }
  board[1][1] = { piece: ROOK, side: "white" }
  board[1][7] = { piece: BISHOP, side: "white" }
  board[2][0] = { piece: PAWN, side: "white" }
  board[2][1] = { piece: PAWN, side: "white" }
  board[2][2] = { piece: PAWN, side: "white" }
  board[2][3] = { piece: PAWN, side: "white" }
  board[2][4] = { piece: PAWN, side: "white" }
  board[2][5] = { piece: PAWN, side: "white" }
  board[2][6] = { piece: PAWN, side: "white" }
  board[2][7] = { piece: PAWN, side: "white" }
  board[2][8] = { piece: PAWN, side: "white" }
  board[6][0] = { piece: PAWN, side: "black" }
  board[6][1] = { piece: PAWN, side: "black" }
  board[6][2] = { piece: PAWN, side: "black" }
  board[6][3] = { piece: PAWN, side: "black" }
  board[6][4] = { piece: PAWN, side: "black" }
  board[6][5] = { piece: PAWN, side: "black" }
  board[6][6] = { piece: PAWN, side: "black" }
  board[6][7] = { piece: PAWN, side: "black" }
  board[6][8] = { piece: PAWN, side: "black" }
  board[7][1] = { piece: BISHOP, side: "black" }
  board[7][7] = { piece: ROOK, side: "black" }
  board[8][0] = { piece: LANCE, side: "black" }
  board[8][1] = { piece: KNIGHT, side: "black" }
  board[8][2] = { piece: SILVER, side: "black" }
  board[8][3] = { piece: GOLD, side: "black" }
  board[8][4] = { piece: KING, side: "black" }
  board[8][5] = { piece: GOLD, side: "black" }
  board[8][6] = { piece: SILVER, side: "black" }
  board[8][7] = { piece: KNIGHT, side: "black" }
  board[8][8] = { piece: LANCE, side: "black" }
  return board;
}

export const EMPTY_SQUARES: Squares = new Array(BOARD_HEIGHT).fill(null).map(() => new Array(BOARD_WIDTH).fill(null));
export const DEFAULT_SQUARES: Squares = generateDefaultBoard();
export const DEFAULT_BOARD: Board = {
  squares: DEFAULT_SQUARES,
  hands: {
    black: [],
    white: [],
  }
}

export type Point = { x: number, y: number }

const PIECE_MOVE_DIRECTIONS = [
  "forwardLeft",
  "forward",
  "forwardRight",
  "left",
  "right",
  "backwardLeft",
  "backward",
  "backwardRight",
  "leftJump",
  "rightJump",
];

const MOVE_TYPES = {
  cannotMove: 0,
  canMoveSingle: 1,
  canMoveMultiple: 8,
}

type MoveType = typeof MOVE_TYPES[keyof typeof MOVE_TYPES];
const CAN_MOVE_SINGLE:MoveType = MOVE_TYPES.canMoveSingle;
const CANNOT_MOVE:MoveType = MOVE_TYPES.cannotMove;
const CAN_MOVE_MULTIPLE:MoveType = MOVE_TYPES.canMoveMultiple;

type PieceMove = Record<typeof PIECE_MOVE_DIRECTIONS[number], number>;

// type PieceMove = {
//   forwardLeft: number,
//   forward: number,
//   forwardRight: number,
//   left: number,
//   right: number,
//   backwardLeft: number,
//   backward: number,
//   backwardRight: number,
//   leftJump: number,
//   rightJump: number,
// }

const PIECE_MOVE_DIRECTION_POINT: Record<typeof PIECE_MOVE_DIRECTIONS[number], Point> = {
  forwardLeft: {x:-1, y:-1},
  forward: {x:0, y:-1},
  forwardRight: {x:1, y:-1},
  left: {x:-1, y:0},
  right: {x:1, y:0},
  backwardLeft: {x:-1, y:1},
  backward: {x:0, y:1},
  backwardRight: {x:1, y:1},
  leftJump: {x:-1, y:-2},
  rightJump: {x:1, y:-2},
}

const PieceMoveOf = (move: Partial<PieceMove>) => {
  return {
    forwardLeft: move.forwardLeft ?? CANNOT_MOVE,
    forward: move.forward ?? CANNOT_MOVE,
    forwardRight: move.forwardRight ?? CANNOT_MOVE,
    left: move.left ?? CANNOT_MOVE,
    right: move.right ?? CANNOT_MOVE,
    backwardLeft: move.backwardLeft ?? CANNOT_MOVE,
    backward: move.backward ?? CANNOT_MOVE,
    backwardRight: move.backwardRight ?? CANNOT_MOVE,
    leftJump: move.leftJump ?? CANNOT_MOVE,
    rightJump: move.rightJump ?? CANNOT_MOVE,
  }
}

const PAWN_MOVE: PieceMove = PieceMoveOf({
  forward:CAN_MOVE_SINGLE
});
const GOLD_MOVE: PieceMove = PieceMoveOf({
  forwardLeft: CAN_MOVE_SINGLE,
  forward: CAN_MOVE_SINGLE,
  forwardRight: CAN_MOVE_SINGLE,
  left: CAN_MOVE_SINGLE,
  right: CAN_MOVE_SINGLE,
  backward: CAN_MOVE_SINGLE,
});
const SILVER_MOVE: PieceMove = PieceMoveOf({
  forwardLeft: CAN_MOVE_SINGLE,
  forward: CAN_MOVE_SINGLE,
  forwardRight: CAN_MOVE_SINGLE,
  backwardLeft: CAN_MOVE_SINGLE,
  backwardRight: CAN_MOVE_SINGLE,
});
const KNIGHT_MOVE: PieceMove = PieceMoveOf({
  leftJump: CAN_MOVE_SINGLE,
  rightJump: CAN_MOVE_SINGLE,
});
const LANCE_MOVE: PieceMove = PieceMoveOf({
  forward: CAN_MOVE_MULTIPLE,
});
const ROOK_MOVE: PieceMove = PieceMoveOf({
  forward: CAN_MOVE_MULTIPLE,
  left: CAN_MOVE_MULTIPLE,
  right: CAN_MOVE_MULTIPLE,
  backward: CAN_MOVE_MULTIPLE,
});
const PROMOTED_ROOK_MOVE: PieceMove = PieceMoveOf({
  forwardLeft: CAN_MOVE_SINGLE,
  forward: CAN_MOVE_MULTIPLE,
  forwardRight: CAN_MOVE_SINGLE,
  left: CAN_MOVE_MULTIPLE,
  right: CAN_MOVE_MULTIPLE,
  backwardLeft: CAN_MOVE_SINGLE,
  backward: CAN_MOVE_MULTIPLE,
  backwardRight: CAN_MOVE_SINGLE,
});
const BISHOP_MOVE: PieceMove = PieceMoveOf({
  forwardLeft: CAN_MOVE_MULTIPLE,
  forwardRight: CAN_MOVE_MULTIPLE,
  backwardLeft: CAN_MOVE_MULTIPLE,
  backwardRight: CAN_MOVE_MULTIPLE,
});
const PROMOTED_BISHOP_MOVE: PieceMove = PieceMoveOf({
  forwardLeft: CAN_MOVE_MULTIPLE,
  forward: CAN_MOVE_SINGLE,
  forwardRight: CAN_MOVE_MULTIPLE,
  left: CAN_MOVE_SINGLE,
  right: CAN_MOVE_SINGLE,
  backwardLeft: CAN_MOVE_MULTIPLE,
  backward: CAN_MOVE_SINGLE,
  backwardRight: CAN_MOVE_MULTIPLE,
});
const KING_MOVE: PieceMove = PieceMoveOf({
  forwardLeft: CAN_MOVE_SINGLE,
  forward: CAN_MOVE_SINGLE,
  forwardRight: CAN_MOVE_SINGLE,
  left: CAN_MOVE_SINGLE,
  right: CAN_MOVE_SINGLE,
  backwardLeft: CAN_MOVE_SINGLE,
  backward: CAN_MOVE_SINGLE,
  backwardRight: CAN_MOVE_SINGLE,
});

const getPieceMoveOf = ({type, promoted}: Piece): PieceMove => {
  if(type==="king") return KING_MOVE;
  if(type==="rook") return promoted? PROMOTED_ROOK_MOVE:ROOK_MOVE;
  if(type==="bishop") return promoted? PROMOTED_BISHOP_MOVE:BISHOP_MOVE;
  if(type==="gold" || promoted) return GOLD_MOVE;
  if(type==="silver") return SILVER_MOVE;
  if(type==="knight") return KNIGHT_MOVE;
  if(type==="lance") return LANCE_MOVE;
  if(type==="pawn") return PAWN_MOVE;
  return PieceMoveOf({});
}

const isOutOfRange = (point:Point):boolean =>
  point.x < 0 || point.x >= 9 || point.y < 0 || point.y >= 9;

export const getSelectableMovePoints = (point: Point, squares: Squares, currentSide: Side): Point[] => {
  const square = squares[point.y][point.x];
  if(square){
    const reversed = square.side!==currentSide;
    const moves: PieceMove = getPieceMoveOf(square.piece);
    const points: Point[] = [];
    PIECE_MOVE_DIRECTIONS.forEach(direction=>{
      const weight = moves[direction];
      const dp:Point = PIECE_MOVE_DIRECTION_POINT[direction];
      for(let i = 1; i<=weight; i++){
        const x = point.x + dp.x*i*(reversed?-1:1);
        const y = point.y + dp.y*i*(reversed?-1:1);
        if(isOutOfRange({x, y})){
          break;
        }
        const targetSquare = squares[y][x];
        if(!targetSquare){
          points.push({x, y});
        } else {
          if(targetSquare.side!==square.side && targetSquare.piece.type!=="king"){
            points.push({x, y});
          }
          break;
        }
      }
    })
    return points;
  }
  return [];
}

export const getSelectablePutPoints = (type: PieceType, squares: Squares, currentSide: Side): Point[] => {
  const points: Point[] = [];
  const forbiddenColumns = type!=="pawn"?[]:
    Array.from(Array(9).keys()).filter(x=>
      Array.from(Array(9).keys()).some(y=>{
        const square = squares[y][x];
        return square && square.side===currentSide && square.piece.type==="pawn" && !square.piece.promoted;
      })
    );

  for(let y = 0; y<9; y++){
    for(let x = 0; x<9; x++){
      if(!squares[y][x] && !forbiddenColumns.includes(x)){
        points.push({x, y});
      }
    }
  }
  return points;
}

export const reversed = (squares: Squares): Squares => {
  const reversed = [];
  for (let i = 8; i >= 0; i--) {
    const row = [];
    for (let j = 8; j >= 0; j--) {
      row.push(squares[i][j]);
    }
    reversed.push(row);
  }
  return reversed;
}

export const reverseBoardIfWhite = (squares: Squares, side: Side): Squares => {
  switch(side){
    case "black": return squares;
    case "white": return reversed(squares);
  }
}

export const reversePointIfWhite = (point: Point, side: Side): Point => {
  switch(side){
    case "black": return point;
    case "white": return {x: 8 - point.x, y: 8 - point.y};
  }
}

export type Move = {
  side: Side,
  from?: Point,
  to: Point,
  piece: Piece,
}

