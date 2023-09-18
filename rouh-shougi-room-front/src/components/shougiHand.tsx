import { PIECE_TYPES, PieceType } from "@/type"
import { ShougiImage } from "./shougiImage";

interface Props {
  hand: PieceType[],
  isEnemy?: boolean,
  selectedPiece?: PieceType,
  handlePieceClick?: (type: PieceType) => void,
}

export const ShougiHand = function ShougiHand({
  hand,
  isEnemy = false,
  selectedPiece,
  handlePieceClick,
}: Props) {
  const pieceTypeCounters = PIECE_TYPES
    .map(type => ({ type, count: hand.filter(t => t === type).length }))
    .filter(data => data.count > 0);
  const counterRowContent = Array.from(Array(9).keys()).map(index => {
    const count = (index < pieceTypeCounters.length) ? pieceTypeCounters[index].count : 0;
    const text: string = count ? count.toString() : "";
    return <td key={index} className="text-xs text-center">{text}</td>
  });

  return (
    <table className="border border-black bg-[#fcebca]">
      <tbody>
        {isEnemy &&
          <tr className="h-5">
            {counterRowContent}
          </tr>
        }
        <tr>
          {Array.from(Array(9).keys()).map(index => {
            if (index < pieceTypeCounters.length) {
              const { type } = pieceTypeCounters[index]
              const isSelected = selectedPiece===type;
              return (
                <td key={index}
                  className={["w-10 h-10", isSelected? "bg-[#f08080]" : ""].join(" ")}
                  onClick={()=>{
                    if(handlePieceClick){
                      handlePieceClick(type);
                    }
                  }}>
                  <ShougiImage piece={{ type, promoted: false }} reversed={isEnemy} />
                </td>
              )
            }
            return (
              <td key={index} className="w-10 h-10" />
            )
          })}
        </tr>
        {!isEnemy &&
          <tr className="h-5">
            {counterRowContent}
          </tr>
        }
      </tbody>
    </table>
  )
}