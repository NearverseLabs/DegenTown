import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Grid from "@mui/material/Grid";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { ConnectedWalletAccount, Contract } from "near-api-js";
import { createNotify, savecoinflipResult } from "../utils/service";
import moment from "moment";

import TwitterIcon from "@mui/icons-material/Twitter";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import { decode } from "base-64";
import { DOMAIN, SERVER_URL } from "../config/config";
import {
  RaffleContractAddress,
  TokenContractAddress,
} from "../config/contract";
import { useRef } from "react";
import {
  ButtonGroup,
  Collapse,
  Divider,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";

import coinflag from "../assets/img/coinflag.svg";
import uploadIcon from "../assets/img/upload.svg";
import discord from "../assets/discord.svg";
import nftImage from "../assets/img/nft.svg";
import discordIcon from "../assets/img/discordIcon.svg";
import ExpandMore from "../assets/img/upIcon.svg";
import ExpandLess from "../assets/img/downIcon.svg";
import redCoin from "../assets/headsCoin.webp";
import yrect from "../assets/img/yrect.svg";
import bbtn from "../assets/img/bbtn.svg";
import bgTable from "../assets/img/bgTable.svg";
import tossCoin from "../assets/img/tossCoin.svg";
import tailCoin from "../assets/tailsCoin.webp";
import randomCoin from "../assets/randomCoin.webp";
import option from "../assets/img/option.svg";
import option2 from "../assets/img/1day.svg";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import floor from "floor";
import { useWallet } from "@manahippo/aptos-wallet-adapter";
import {
  AptosClient,
  AptosAccount,
  FaucetClient,
  TokenClient,
  CoinClient,
} from "aptos";
import { NODE_URL, FAUCET_URL, aptosCoinStore } from "../config/section";
import axios from "axios";
import HistoryIcon from "@mui/icons-material/History";

const APTOS_RPC = "https://fullnode.mainnet.aptoslabs.com/v1";
const columns = [
  { id: "sender", label: "Address", minWidth: 170 },
  { id: "tossflag", label: "Coin", minWidth: 100 },
  {
    id: "amount",
    label: "Bet Amount",
  },
  {
    id: "hash",
    label: "Hash",
    minWidth: 170,
  },
  {
    id: "result",
    label: "Result",
  },
];

const leaderboard_columns = [
  { id: "username", label: "UserName", minWidth: 170 },
  { id: "profit", label: "Net Gains", minWidth: 100 },
  {
    id: "count",
    label: "Volumn(APT)",
  },
  {
    id: "latest",
    label: "Last Flip",
  },
];

var effectFlag = false;

export default function CoinFlip() {
  const client = new AptosClient(NODE_URL);
  const coinClient = new CoinClient(client);

  const wallettype = localStorage.getItem("walletflag");
  const disData = JSON.parse(localStorage.getItem("discordUser"));
  const { signAndSubmitTransaction } = useWallet();
  const [page, setPage] = useState(0);
  const [tosscoinresult, settosscoinresult] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [betAmount, setBetAmount] = useState(0.1);
  const [tossFlag, setTossFlag] = useState(0);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [LeaderboardData, setLeaderBoardData] = useState([]);
  const [Balance, setWalletBalance] = useState(0);
  const [btnActive, setBtnActive] = useState(1);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const [historyType, setHistoryType] = useState(true);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const getLeaderBoardData = async (val) => {
    let data = await axios.post(`${SERVER_URL}/getLeaderboard`, {
      data: val,
    });
    setLeaderBoardData(data.data);
  };

  const TossCoin = async () => {
    setLoading(true);
    try {
      if (wallettype === "a") {
        var connected = await window.martian.isConnected();
        if (connected) {
          var chainData = await window.martian.getChainId();
          if (chainData.chainId === 1) {
            if (betAmount <= 5) {
              if (betAmount >= 0.1) {
                setBetAmount(floor(betAmount, -3));
                var wallet = await window.martian.connect();

                var transactions = await window.martian.getAccountResources(
                  wallet.address
                );

                let account = transactions.find(
                  ({ type }) =>
                    type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
                );
                var curPrice = account.data.coin.value;

                if (curPrice >= betAmount * 10 ** 8) {
                  var tossflag = 0;
                  let payload = {
                    type: "script_function_payload",
                    function:
                      "0xafaec995f57c2ce9f4c28e72173163970614ee0e1a308fd1f3e4453673788e98::flipcoin::play",
                    type_arguments: [],
                    arguments: [
                      Math.floor(Math.random() * 10),
                      tossflag,
                      Math.floor(betAmount * 10 ** 8),
                    ],
                  };

                  const txnRequest = await window.martian.generateTransaction(
                    wallet.address,
                    payload
                  );
                  const txhash = await window.martian.signAndSubmitTransaction(
                    txnRequest
                  );

                  let data = {
                    sender: wallet.address,
                    tossflag: tossFlag,
                    amount: betAmount,
                    hash: txhash,
                    username: `${disData.username}${disData.discriminator}`,
                    userid: disData.id,
                  };

                  setTimeout(async () => {
                    const transaction_api_rul = `${APTOS_RPC}/transactions/by_hash/${txhash}`;
                    const res = await fetch(transaction_api_rul);
                    const txJson = await res.json();
                    if (txJson && txJson.events) {
                      let events = txJson.events;
                      if (events.length > 1) {
                        data.result = "true";
                      } else {
                        data.result = "false";
                      }
                      const result = await savecoinflipResult({ data: data });
                      if (result.data === "already exist") {
                        createNotify("error", "Transaction duplicated");
                        setLoading(false);
                      } else {
                        if (result.data.data.result === "true") {
                          settosscoinresult(data.result);
                          setBalance();
                          setTimeout(() => {
                            settosscoinresult("");
                          }, 5000);
                          setLoading(false);
                        } else {
                          settosscoinresult(data.result);
                          setLoading(false);
                          setBalance();
                          setTimeout(() => {
                            settosscoinresult("");
                          }, 5000);
                        }
                      }
                    }
                  }, 2000);
                } else {
                  toast.error("Not enough coin");
                  setLoading(false);
                }
              } else {
                toast.error("Minimum betamount is 0.1apt!");
                setLoading(false);
              }
            } else {
              toast.error("Max betamount is 5apt!");
              setLoading(false);
            }
          } else {
            toast.error("Connect the Mainnet!");
            setLoading(false);
          }
        } else {
          toast.error("Connect the wallet!");
          setLoading(false);
        }
      } else {
        toast.error("Change wallet to aptos");
        setLoading(false);
      }
    } catch (error) {
      createNotify("error", error);
      setLoading(false);
    }
    setBalance();
  };

  const getHistory = async () => {
    let result = await axios.get(`${SERVER_URL}/getHistory`);
    setHistory(result.data.data.reverse());
  };

  const setBalance = async () => {
    var wallet = await window.martian.connect();
    var transactions = await window.martian.getAccountResources(wallet.address);
    let account = transactions.find(
      ({ type }) => type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    var curPrice = account.data.coin.value;
    setWalletBalance((Number(curPrice) / 100000000).toFixed(2));
  };

  useEffect(() => {
    getLeaderBoardData(1);
  }, []);

  useEffect(() => {
    if (!effectFlag && wallettype === "a") {
      effectFlag = true;
      setBalance();
    }
  }, []);

  useEffect(() => {
    getHistory();
  }, []);

  return (
    <Box sx={{ px: "50px", pb: "50px" }}>
      <div
        style={{
          background: "#EBE3FF",
          height: "80vh",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <h1>Coin Flip Game</h1>
        <div style={{ textAlign: "center" }}>
          $Apt Coin Flip. Play responsibly. All winnings incur a fee of 3%
        </div>
        <div
          style={{
            display: "flex",
            gap: "60px",
            width: "70vw",
            height: "55vh",
            justifyContent: "center",
            background: `url(${bgTable})`,
            backgroundSize: "100% 100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              zIndex: "9",
              flexDirection: "column",
              alignItems: "center",
              gap: "30px",
            }}
          >
            <div>
              {tossFlag === 0 ? (
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img src={coinflag} width="150px" />
                  <span
                    style={{
                      color: "red",
                      position: "absolute",
                      fontSize: "50px",
                      fontWeight: "bold",
                    }}
                  >
                    H
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img src={coinflag} width="150px" />
                  <span
                    style={{
                      color: "#42a5f5",
                      position: "absolute",
                      fontSize: "50px",
                      fontWeight: "bold",
                    }}
                  >
                    T
                  </span>
                </div>
              )}
            </div>
            <div>
              {tosscoinresult === "" ? (
                <span
                  style={{
                    color: "white",
                    fontSize: "30px",
                    fontWeight: "bold",
                  }}
                >
                  Ready , Good Luck!
                </span>
              ) : tosscoinresult === "false" ? (
                <span
                  style={{
                    color: "red",
                    fontSize: "30px",
                    fontWeight: "bold",
                  }}
                >
                  You Lose!
                </span>
              ) : (
                <span
                  style={{
                    color: "#0aff4a",
                    fontSize: "30px",
                    fontWeight: "bold",
                  }}
                >
                  You Won!
                </span>
              )}
            </div>
            <div
              style={{
                background: `url(${yrect})`,
                backgroundSize: "100% 100%",
                padding: "20px 100px",
              }}
            >
              <Button
                variant="text"
                sx={{ color: "black", fontSize: "16px", fontWeight: "bold" }}
                className={tossFlag === 0 ? "activeBtn" : ""}
                onClick={() => {
                  setTossFlag(0);
                }}
              >
                Heads
              </Button>
              <Button
                variant="text"
                className={tossFlag === 1 ? "activeBtn" : ""}
                sx={{ color: "black", fontSize: "16px", fontWeight: "bold" }}
                onClick={() => {
                  setTossFlag(1);
                }}
              >
                Tails
              </Button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "400px",
              flexDirection: "column",
              gap: "30px",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex" }}>
              <div style={{ flex: "1" }}></div>
              <div>
                <Button
                  variant="text"
                  className="activeBtn"
                  sx={{
                    fontSize: "12px !important",
                    padding: "17px 25px !important",
                  }}
                >
                  Balance :<span style={{ color: "yellow" }}>{Balance}apt</span>
                </Button>
              </div>
            </div>
            <h2 style={{ color: "white", textAlign: "center", margin: "0px" }}>
              Bet Setting
            </h2>
            <Box
              style={{
                background: `url(${yrect})`,
                backgroundSize: "100% 100%",
                padding: "10px 20px",
                display: "flex",
                gap: "10px",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, color: "black" }}
                placeholder="Please Input the Bet Amount"
                inputProps={{ "aria-label": "search google maps" }}
                type="number"
                value={betAmount}
                disabled={loading}
                onChange={(e) => {
                  if (e.target.value < 0) {
                    setBetAmount(-e.target.value);
                  } else {
                    setBetAmount(e.target.value);
                  }
                }}
              />
              <Button variant="text" className="activeBtn">
                Aptos
              </Button>
            </Box>
            <Box sx={{ display: "flex" }}>
              <LoadingButton
                loading={loading}
                variant="text"
                fullWidth
                sx={{
                  background: `url(${tossCoin})`,
                  backgroundSize: "100% 100%",
                  color: "white",
                  p: "16px",
                  fontSize: "16px",
                }}
                onClick={TossCoin}
              >
                Flip Coin
              </LoadingButton>
            </Box>
            <Box sx={{ color: "white", textAlign: "center" }}>
              Double or Nothing
            </Box>
          </div>
        </div>
      </div>
      {historyType ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              paddingTop: "20px",
              gap: "10px",
            }}
          >
            <h1 style={{ fontWeight: "bold", my: "50px !important" }}>
              History
            </h1>
            <Box>
              <Button
                variant="text"
                aria-label="fingerprint"
                endIcon={<HistoryIcon />}
                onClick={getHistory}
                sx={{
                  color: "black",
                  fontSize: "16px",
                  fontWeight: "bold",
                  p: "40px !important",
                }}
                className="activeBtn"
              >
                Latest
              </Button>
            </Box>
            <Box sx={{ flex: "1" }}></Box>
            <Button
              onClick={() => {
                setHistoryType(!historyType);
              }}
              variant="text"
              sx={{
                color: "black",
                fontSize: "16px",
                fontWeight: "bold",
                p: "20px !important",
              }}
              className="activeBtn"
            >
              Leaderboard
            </Button>
          </Box>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ height: "auto" }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow
                    style={{
                      backgroundColor: "rgba(235, 227, 255, 1)",
                      color: "rgba(52, 66, 88, 1)",
                      fontWeight: "bold",
                    }}
                  >
                    {columns.map((column) => {
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{
                            minWidth: column.minWidth,
                            backgroundColor: "rgba(235, 227, 255, 1)",
                            color: "rgba(52, 66, 88, 1)",
                            fontWeight: "bold",
                          }}
                        >
                          {column.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, k) => {
                      return (
                        <TableRow
                          style={{
                            backgroundColor: "rgba(235, 227, 255, 1)",
                            color: "rgba(52, 66, 88, 1)",
                            fontWeight: "bold",
                          }}
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={k}
                        >
                          {columns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell
                                key={column.id}
                                align={column.align}
                                style={{
                                  backgroundColor: "rgba(235, 227, 255, 1)",
                                  color: "rgba(52, 66, 88, 1)",
                                  fontWeight: "bold",
                                }}
                              >
                                {column.id === "result" && value !== "true"
                                  ? "Lost"
                                  : column.id === "result" && value === "true"
                                  ? "Won"
                                  : column.id === "tossflag" && value === "0"
                                  ? "Heads"
                                  : column.id === "tossflag" && value === "1"
                                  ? "Tails"
                                  : column.id === "tossflag" && value === "2"
                                  ? "Random"
                                  : column.id === "sender" ||
                                    column.id === "hash"
                                  ? value.slice(0, 10) +
                                    "....." +
                                    value.slice(-10)
                                  : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={history.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              style={{
                backgroundColor: "rgba(235, 227, 255, 1)",
                color: "rgba(52, 66, 88, 1)",
                fontWeight: "bold",
              }}
            />
          </Paper>
        </>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              paddingTop: "20px",
              gap: "10px",
            }}
          >
            <h1 style={{ fontWeight: "bold", my: "50px !important" }}>
              Leaderboard
            </h1>
            <div
              style={{
                background: `url(${option})`,
                backgroundSize: "100% 100%",
                padding: "10px 20px",
              }}
            >
              <Button
                variant="text"
                sx={{ color: "white", fontSize: "16px", fontWeight: "bold" }}
                className={btnActive === 1 ? "btn_leaderboard" : ""}
                onClick={() => {
                  getLeaderBoardData(1);
                  setBtnActive(1);
                }}
              >
                1 Day
              </Button>
              <Button
                variant="text"
                sx={{ color: "white", fontSize: "16px", fontWeight: "bold" }}
                className={btnActive === 2 ? "btn_leaderboard" : ""}
                onClick={() => {
                  getLeaderBoardData(2);
                  setBtnActive(2);
                }}
              >
                1 Week
              </Button>
              <Button
                variant="text"
                className={btnActive === 3 ? "btn_leaderboard" : ""}
                sx={{ color: "white", fontSize: "16px", fontWeight: "bold" }}
                onClick={() => {
                  getLeaderBoardData(3);
                  setBtnActive(3);
                }}
              >
                1 Month
              </Button>
            </div>
            <Box sx={{ flex: "1" }}></Box>
            <Button
              onClick={() => {
                setHistoryType(!historyType);
              }}
              variant="text"
              sx={{
                color: "black",
                fontSize: "16px",
                fontWeight: "bold",
                p: "50px !important",
              }}
              className="activeBtn"
            >
              History
            </Button>
          </Box>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ height: "auto" }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow
                    style={{
                      backgroundColor: "rgba(235, 227, 255, 1)",
                      color: "rgba(52, 66, 88, 1)",
                      fontWeight: "bold",
                    }}
                  >
                    {leaderboard_columns.map((column) => {
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{
                            minWidth: column.minWidth,
                            backgroundColor: "rgba(235, 227, 255, 1)",
                            color: "rgba(52, 66, 88, 1)",
                            fontWeight: "bold",
                          }}
                        >
                          {column.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {LeaderboardData.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  ).map((row, k) => {
                    return (
                      <TableRow
                        style={{
                          backgroundColor: "rgba(235, 227, 255, 1)",
                          color: "rgba(52, 66, 88, 1)",
                          fontWeight: "bold",
                        }}
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={k}
                      >
                        {leaderboard_columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell
                              key={column.id}
                              align={column.align}
                              style={{
                                backgroundColor: "rgba(235, 227, 255, 1)",
                                color: "rgba(52, 66, 88, 1)",
                                fontWeight: "bold",
                              }}
                            >
                              {column.id === "profit"
                                ? value.toFixed(2)
                                : column.id === "latest" && value === "0"
                                ? "Heads"
                                : column.id === "latest" && value === "1"
                                ? "Tails"
                                : value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={LeaderboardData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              style={{
                backgroundColor: "rgba(235, 227, 255, 1)",
                color: "rgba(52, 66, 88, 1)",
                fontWeight: "bold",
              }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
}
