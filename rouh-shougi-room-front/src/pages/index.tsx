import { ShougiNet } from "@/components/shougiNet";

interface Props {
  websocketUrl: string,
}

export default function Home({ websocketUrl }: Props) {
  return (
    <div className="w-fit mx-auto">
      <ShougiNet websocketUrl={websocketUrl}/>
    </div>
  )
} 

export async function getServerSideProps() {
  const websocketUrl = process.env.WEBSOCKET_URL || "";
  console.log(`url: ${websocketUrl}`);
  return {
    props: {
      websocketUrl
    }
  };
}


