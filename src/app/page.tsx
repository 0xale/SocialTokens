import Image from "next/image";
import homeStyle from "./Styles/HomePage.module.css";


export default function Home() {
  return (
    <div className={homeStyle.container}>
      <h1 className={homeStyle.header}>Farcaster Tokens</h1>
      <div className={homeStyle.image}>
       
      </div>
    </div>
  );
}
