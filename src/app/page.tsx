import Image from "next/image";
import homeStyle from "./Styles/HomePage.module.css";


export default function Home() {
  return (
    <div className={homeStyle.container}>
      <h1 className={homeStyle.header}>Social Tokens</h1>
      <div className={homeStyle.image}>
      Our platform enables users to create social tokens, leveraging a bonding curve mechanism to dynamically set their value. As more tokens are issued and Farcaster follower counts increase, the value of each token rises. This system facilitates user engagement and enhances token value through its growth-based pricing model.
      </div>
    </div>
  );
}
