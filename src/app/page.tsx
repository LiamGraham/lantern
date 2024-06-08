import ChatPane from "../components/chat/chatPane";

export default async function Home() {
  return (
    <main className="flex flex-col h-screen w-full items-center justify-center px-52">
      <ChatPane/>
    </main>
  );
}
