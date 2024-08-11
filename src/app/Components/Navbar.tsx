import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../Styles/Nav.module.css"

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <Link href="/">Home</Link>
        </div>
        <div className={styles.logo}>
        <Link href="/all-tokens">Buy Tokens</Link>
        <Link href={{pathname:"/create-tokens"}}>Launch Token</Link>
        <Link href={{pathname:"/user-tokens"}}>View Your Tokens</Link>
       

        </div>

      
      <div className={styles.navLinks}>
        <div className={styles.connectButtonWrapper}>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
