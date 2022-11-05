import React, { lazy, useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Loadable from "./utils/loadable";
import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";

import { Buffer } from "buffer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import SolWalletProvider from "./config/wallet";

const Layout = Loadable(lazy(() => import("./layout")));
const Raffle = Loadable(lazy(() => import("./pages/raffle")));
const Callback = Loadable(lazy(() => import("./pages/callback")));
const CoinFlip = Loadable(lazy(() => import("./pages/coinflip")));

// eslint-disable-next-line no-undef
globalThis.Buffer = Buffer;

export default function App() {
  const [wallet, setWallet] = useState(undefined);
  const [walletFlag, setwalletFlag] = useState("a");

  const init = useCallback(async () => {
    const getProvider = () => {
      if ("martian" in window) {
        return window.martian;
      }
    };
    setWallet(getProvider);
  }, []);

  function getLibrary(provider) {
    return new Web3(provider);
  }

  useEffect(() => {
    init();
  }, [init]);

  return (
    <SolWalletProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Router>
          <Routes>
            <Route element={<Layout getWallet={setwalletFlag} />}>
              <Route path="/auth/callback" element={<Callback />} />
              <Route path="/" element={<Raffle walletFlag={walletFlag} />} />
              <Route
                path="/raffles"
                element={<Raffle walletFlag={walletFlag} />}
              />
              <Route
                path="/coinflip"
                element={<CoinFlip walletFlag={walletFlag} />}
              />
            </Route>
          </Routes>
        </Router>
      </Web3ReactProvider>
      <ToastContainer />
    </SolWalletProvider>
  );
}
