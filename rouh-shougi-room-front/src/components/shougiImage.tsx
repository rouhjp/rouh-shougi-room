import { Piece } from "@/type"
import { memo } from "react";

const getPieceImageFilePath = (piece: Piece, isEnemy: boolean) => 
  `pieces/full/${isEnemy?"r_":"s_"}${piece.promoted?"promoted_":""}${piece.type}.png`

interface Props {
  piece: Piece,
  reversed?: boolean,
}

export const ShougiImage = memo(function ShougiImage({
  piece,
  reversed: isEnemy = false,
}: Props) {
  return <img src={getPieceImageFilePath(piece, isEnemy)} />
});
