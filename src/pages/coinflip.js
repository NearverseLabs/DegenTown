import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { InputBase } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import HistoryIcon from "@mui/icons-material/History";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import floor from "floor";
import axios from "axios";
import yrect from "../assets/img/yrect.svg";
import coinflag from "../assets/img/coinflag.svg";
import bgTable from "../assets/img/bgTable.svg";
import tossCoin from "../assets/img/tossCoin.svg";
import option from "../assets/img/option.svg";
import { createNotify, savecoinflipResult } from "../utils/service";
import { SERVER_URL } from "../config/config";
import { Buffer } from "buffer";
import { AptosClient, AptosAccount, CoinClient, FaucetClient } from "aptos";
import { NODE_URL, FAUCET_URL } from "../config/section";

const client = new AptosClient(NODE_URL);
const coinClient = new CoinClient(client);

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
  const wallettype = localStorage.getItem("walletflag");
  const disData = JSON.parse(localStorage.getItem("discordUser"));
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
                  const payload = {
                    function: "0x1::coin::transfer",
                    type_arguments: ["0x1::aptos_coin::AptosCoin"],
                    arguments: [
                      "0xafaec995f57c2ce9f4c28e72173163970614ee0e1a308fd1f3e4453673788e98",
                      Math.floor(betAmount * 10 ** 8),
                    ],
                  };

                  console.log(
                    Math.floor(betAmount * 10 ** 8),
                    "Math.floor(betAmount * 10 ** 8)"
                  );

                  const transaction = await window.martian.generateTransaction(
                    wallet.address,
                    payload
                  );

                  const txnHash = await window.martian.signAndSubmitTransaction(
                    transaction
                  );

                  var gameResult = Math.floor(Math.random() * 10) < 4;
                  if (gameResult) {
                    var privateKey = Uint8Array.from(
                      Buffer.from(process.env.REACT_APP_Private_Key, "hex")
                    );
                    let Admin_account = new AptosAccount(
                      privateKey,
                      "0xafaec995f57c2ce9f4c28e72173163970614ee0e1a308fd1f3e4453673788e98"
                    );
                    let userAccount = new AptosAccount(
                      undefined,
                      wallet.address
                    );
                    let Hash = await coinClient.transfer(
                      Admin_account,
                      userAccount,
                      Math.floor(betAmount * 10 ** 8 * 1.97),
                      {
                        gasUnitPrice: BigInt(100),
                      }
                    );
                    await client.waitForTransaction(Hash, {
                      checkSuccess: true,
                    });
                    let data = {
                      sender: wallet.address,
                      tossflag: tossFlag,
                      amount: betAmount,
                      hash: txnHash,
                      result: true,
                      username: `${disData.username}${disData.discriminator}`,
                      userid: disData.id,
                    };

                    const result = await savecoinflipResult({ data: data });
                    if (result.data === "txn") {
                      createNotify("error", "Transaction Error");
                      setLoading(false);
                    } else {
                      settosscoinresult("true");
                      setBalance();
                      setLoading(false);
                      setTimeout(() => {
                        settosscoinresult("");
                      }, 5000);
                    }
                  } else {
                    let data = {
                      sender: wallet.address,
                      tossflag: tossFlag,
                      amount: betAmount,
                      hash: txnHash,
                      result: false,
                      username: `${disData.username}${disData.discriminator}`,
                      userid: disData.id,
                    };

                    const result = await savecoinflipResult({ data: data });
                    if (result.data === "txn") {
                      createNotify("error", "Transaction Error");
                      setLoading(false);
                    } else {
                      settosscoinresult("false");
                      setBalance();
                      setLoading(false);
                      setTimeout(() => {
                        settosscoinresult("");
                      }, 5000);
                    }
                  }
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
                <Box
                  variant="text"
                  className="activeBtn"
                  sx={{
                    fontSize: "12px !important",
                    padding: "17px 25px !important",
                  }}
                >
                  Balance :<span style={{ color: "yellow" }}>{Balance}apt</span>
                </Box>
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
                sx={{ ml: 1, flex: 1 }}
                className="betAmount"
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
              <Box className="activeBtn">Aptos</Box>
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
