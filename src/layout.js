import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import TwitterIcon from "@mui/icons-material/Twitter";
import { styled } from "@mui/material/styles";
import {
  Backdrop,
  Fade,
  Grid,
  Icon,
  Menu,
  MenuItem,
  Modal,
} from "@mui/material";

import discordIcon from "./assets/img/discordIcon.webp";

import { toast } from "react-toastify";
//// metamask
import { useWeb3React } from "@web3-react/core";
import { injected } from "./config/connector";

// -----solana--
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
// -----

import { createNotify, truncate } from "./utils/service";
import { CLIENT_ID, DOMAIN } from "./config/config";

import logoIcon from "./assets/img/logo.svg";
import aptosIcon from "./assets/wallet/aptos.png";
import metamask from "./assets/wallet/metamask.png";
import footerLogo from "./assets/img/footerlogo.svg";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: "100%",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  background: "#EBE3FF ",
  transform: "translate(-50%, -50%)",
  width: "20vw",
  minWidth: "300px",
  borderRadius: ".75em",
  padding: "3em 2em",
  boxShadow: 24,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const settings = ["Home", "Raffles", "CoinFlip"];

var effectFlag = false;
export default function MainLayout({ getWallet }) {
  const disData = JSON.parse(localStorage.getItem("discordUser"));
  const navigate = useNavigate();
  const [aptosAccount, setAccount] = useState(undefined);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [walletFlag, setWalletFlag] = useState("m");
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElUser2, setAnchorElUser2] = useState(null);
  const [anchorElUser3, setAnchorElUser3] = useState(null);
  const [anchorElUser4, setAnchorElUser4] = useState(null);
  const { active, account, activate, deactivate } = useWeb3React();

  const url = location.pathname;

  const solwallet = useWallet();

  const ConnectWallet = async () => {
    try {
      var wallet = await window.martian.connect();
      setAccount(wallet.address);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const DisconnectWallet = async () => {
    handleCloseUserMenu4();
    await window.martian.disconnect();
    setAccount(undefined);
  };

  const switchNetwork = async (status) => {
    try {
      const provider = window;
      if (provider.ethereum) {
        const chainId = await provider.ethereum.request({
          method: "eth_chainId",
        });
        const ChainId = "0x1";
        if (chainId === ChainId) return;
        try {
          await provider.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ChainId }],
          });
          try {
            await activate(injected);
            handleClose();
          } catch (error) {
            console.log(error);
            createNotify("error", error.message);
          }
        } catch (switchError) {
          console.log(switchError);
          createNotify("error", switchError.message);
        }
      } else if (!status) {
        window.open("https://metamask.io/download/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function connect() {
    var chainId = window.ethereum.chainId;
    if (chainId === "0x1") {
      try {
        await activate(injected);
        handleClose();
      } catch (error) {
        console.log(error);
        createNotify(error.message);
      }
    } else {
      switchNetwork();
    }
  }

  async function disconnect() {
    handleCloseUserMenu3();
    try {
      deactivate();
    } catch (ex) {
      console.log(ex);
    }
  }

  const selectMetamask = () => {
    localStorage.setItem("walletflag", "m");
    setWalletFlag("m");
    getWallet("m");
    handleClose();
  };

  const selectSolana = () => {
    localStorage.setItem("walletflag", "s");
    setWalletFlag("s");
    getWallet("s");
    handleClose();
  };

  const selectAptos = async () => {
    localStorage.setItem("walletflag", "a");
    setWalletFlag("a");
    getWallet("a");
    handleClose();
  };

  const changeWallet = () => {
    handleOpen();
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenUserMenu2 = (event) => {
    setAnchorElUser2(event.currentTarget);
  };

  const handleCloseUserMenu2 = () => {
    setAnchorElUser2(null);
  };

  const handleOpenUserMenu3 = (event) => {
    setAnchorElUser3(event.currentTarget);
  };

  const handleCloseUserMenu3 = () => {
    setAnchorElUser3(null);
  };

  const handleOpenUserMenu4 = (event) => {
    setAnchorElUser4(event.currentTarget);
  };

  const handleCloseUserMenu4 = () => {
    setAnchorElUser4(null);
  };

  const pages = [
    {
      title: "Home",
      link: "/",
    },
    {
      title: "Raffles",
      link: "/raffles",
    },
    {
      title: "CoinFlip",
      link: "/coinflip",
    },
  ];

  const networks = [
    { name: "Ethereum", select: selectMetamask, flag: "m" },
    { name: "Solana", select: selectSolana, flag: "s" },
    { name: "Aptos", select: selectAptos, flag: "a" },
  ];

  const handleDiscordLogin = async () => {
    const OAuthScope = ["identify"].join(" ");
    const OAuthData = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: `${DOMAIN}auth/callback`,
      scope: OAuthScope,
    });
    window.location.href = `https://discordapp.com/oauth2/authorize?${OAuthData}`;
  };

  const handleDiscordLogout = async () => {
    localStorage.removeItem("discordUser");
    window.location.reload();
  };

  const activeWallet = async () => {
    var wallettype = localStorage.getItem("walletflag");
    if (wallettype === null) {
      setWalletFlag("m");
      getWallet("m");
    } else {
      setWalletFlag(wallettype);
      getWallet(wallettype);
    }
    let connected = await window.martian.isConnected();
    if (wallettype === "m" && !active) {
      connect();
    } else if (wallettype === "a" && !connected) {
      ConnectWallet();
    }
  };

  useEffect(() => {
    if (effectFlag === false) {
      effectFlag = true;
      activeWallet();
    }
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div style={style} className="mw80">
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: ".5em",
                right: ".5em",
                color: "black",
              }}
            >
              <CloseIcon />
            </IconButton>
            <span
              style={{
                margin: "0 auto 20px auto",
                marginBottom: "20px",
                color: "black",
              }}
            >
              Select Network
            </span>
            {networks.map((network) => (
              <Button
                sx={{
                  display: "flex",
                  bgcolor: "black",
                  justifyContent: "center",
                  border: "1px solid gray",
                  borderBottom:
                    walletFlag === network.flag
                      ? "5px solid black"
                      : "1px solid gray",
                  background: "#8770B8",
                  marginBottom: "10px",
                }}
                onClick={network.select}
                className="network-button"
              >
                {network.name}
              </Button>
            ))}
          </div>
        </Fade>
      </Modal>
      <AppBar sx={{ background: "white", boxShadow: "none" }}>
        <Toolbar sx={{ m: "10px 50px", p: "0px !important" }} className="m0p10">
          <Typography
            variant="h4"
            sx={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              display: "flex",
            }}
            component="div"
            className="rdc-text-m"
          >
            <img src={logoIcon} />
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: "10px",
              paddingLeft: "30px",
            }}
            className="dn"
          >
            {pages.map((page) => {
              return (
                <Button
                  sx={{
                    fontSize: "20px",
                    color: url === page.link ? "#8770B8" : "black",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    navigate(page.link);
                  }}
                >
                  {page.title}
                </Button>
              );
            })}
          </Box>
          <Box
            sx={{
              flexGrow: "1",
              display: "flex",
              justifyContent: "flex-end",
              py: 1,
              marginLeft: ".5em",
            }}
            className="dn"
          >
            <Button
              sx={{
                textTransform: "unset",
                mr: "20px",
                bgcolor: "#512da8 !important",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              variant="contained"
              size="medium"
              onClick={changeWallet}
              className="btn"
            >
              Change Network
            </Button>

            {walletFlag === "m" ? (
              disData ? (
                active ? (
                  <Button
                    variant="contained"
                    sx={{
                      display: "flex",
                      textTransform: "unset",
                      bgcolor: "#512da8 !important",
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "white",
                    }}
                    onClick={handleOpenUserMenu3}
                    size="large"
                    startIcon={<img src={metamask} style={{ width: "24px" }} />}
                  >
                    {`${truncate(account, [4, 4])}`}
                  </Button>
                ) : (
                  <Button
                    sx={{
                      textTransform: "unset",
                      bgcolor: "#512da8 !important",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                    variant="contained"
                    size="large"
                    onClick={connect}
                    className="btn"
                  >
                    Connect Metamask
                  </Button>
                )
              ) : (
                <Button
                  onClick={handleDiscordLogin}
                  sx={{
                    textTransform: "unset",
                    mr: "20px",
                    bgcolor: "#512da8 !important",
                    fontSize: "16px",
                    fontWeight: "bold",
                    p: "10px",
                  }}
                  variant="contained"
                  size="large"
                  className="btn"
                >
                  Login With Discord
                </Button>
              )
            ) : walletFlag === "s" ? (
              disData ? (
                <Box sx={{ flexGrow: 0 }}>
                  <WalletModalProvider>
                    <WalletModalProvider>
                      <WalletMultiButton />
                    </WalletModalProvider>
                  </WalletModalProvider>
                </Box>
              ) : (
                <Button
                  onClick={handleDiscordLogin}
                  sx={{
                    textTransform: "unset",
                    mr: "20px",
                    bgcolor: "#512da8 !important",
                    fontSize: "16px",
                    fontWeight: "bold",
                    p: "10px",
                  }}
                  variant="contained"
                  size="large"
                  className="btn"
                >
                  Login With Discord
                </Button>
              )
            ) : disData ? (
              <Box sx={{ flexGrow: 0 }}>
                {aptosAccount ? (
                  <Button
                    variant="contained"
                    sx={{
                      display: "flex",
                      textTransform: "unset",
                      bgcolor: "#512da8 !important",
                      height: "100%",
                    }}
                    onClick={handleOpenUserMenu4}
                    className="btn"
                    size="large"
                    startIcon={
                      <img
                        src={aptosIcon}
                        style={{ width: "24px", borderRadius: "50%" }}
                      />
                    }
                  >
                    <Typography>{`${truncate(
                      aptosAccount,
                      [5, 5]
                    )}`}</Typography>
                  </Button>
                ) : (
                  <Button
                    sx={{
                      textTransform: "unset",
                      bgcolor: "#4e2ba1 !important",
                    }}
                    variant="contained"
                    size="large"
                    onClick={ConnectWallet}
                    className="btn"
                  >
                    Connect Aptos
                  </Button>
                )}
              </Box>
            ) : (
              <Button
                onClick={handleDiscordLogin}
                sx={{
                  textTransform: "unset",
                  mr: "20px",
                  bgcolor: "#512da8 !important",
                  fontSize: "16px",
                  fontWeight: "bold",
                  p: "10px",
                }}
                variant="contained"
                size="large"
                className="btn"
              >
                Login With Discord
              </Button>
            )}

            {disData ? (
              disData && disData.avatar !== null ? (
                <img
                  // src={`https://lh3.google.com/u/0/d/1zed-ayMn6z7qhdg760Uv5_C27Fsve1Wy=w200-h190-p-k-nu-iv1`}
                  src={`https://cdn.discordapp.com/avatars/${disData.id}/${disData.avatar}.webp?size=128`}
                  alt="d_avatar"
                  style={{
                    borderRadius: "50%",
                    width: "50px",
                    marginLeft: "20px",
                  }}
                  onClick={handleOpenUserMenu2}
                />
              ) : (
                <AccountCircleIcon sx={{ color: "white" }} />
              )
            ) : (
              <></>
            )}
            <Menu
              sx={{ mt: "60px" }}
              id="menu-appbar"
              anchorEl={anchorElUser2}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser2)}
              onClose={handleCloseUserMenu2}
              className="usermenu"
            >
              {(walletFlag === "m" && active) ||
              (walletFlag === "s" && solwallet.connected) ? (
                <MenuItem>
                  <Typography textAlign="center" sx={{ px: "20px" }}>
                    Profile
                  </Typography>
                </MenuItem>
              ) : (
                <></>
              )}
              <MenuItem onClick={handleDiscordLogout}>
                <Typography textAlign="center" sx={{ px: "20px" }}>
                  LogOut
                </Typography>
              </MenuItem>
            </Menu>
            <Menu
              sx={{ mt: "60px" }}
              id="menu-appbar"
              anchorEl={anchorElUser3}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser3)}
              onClose={handleCloseUserMenu3}
              className="usermenu"
            >
              <MenuItem onClick={disconnect}>
                <Typography textAlign="center" sx={{ px: "20px" }}>
                  Disconnect
                </Typography>
              </MenuItem>
            </Menu>
            <Menu
              sx={{ mt: "60px" }}
              id="menu-appbar"
              anchorEl={anchorElUser4}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser4)}
              onClose={handleCloseUserMenu4}
              className="usermenu"
            >
              <MenuItem onClick={DisconnectWallet}>
                <Typography textAlign="center" sx={{ px: "20px" }}>
                  Disconnect
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
          <div className="pdn" style={{ flex: "1" }}></div>
          <Box className="pdn">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ color: "black" }}
              onClick={handleOpenUserMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
        <Box
          className="pdn2"
          sx={{
            justifyContent: "center",
            alignItems: "center",
            p: "0px 10px",
          }}
        >
          <Button
            sx={{
              textTransform: "unset",
              mr: "20px",
              bgcolor: "#512da8 !important",
              fontSize: "16px",
              fontWeight: "bold",
              p: "10px",
            }}
            variant="contained"
            size="large"
            className="btn"
            onClick={changeWallet}
          >
            Change Network
          </Button>

          {walletFlag === "m" ? (
            disData ? (
              active ? (
                <Button
                  variant="contained"
                  sx={{
                    display: "flex",
                    textTransform: "unset",
                    bgcolor: "#512da8 !important",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                  onClick={disconnect}
                  size="large"
                  startIcon={<img src={metamask} style={{ width: "24px" }} />}
                >
                  {`${truncate(account, [4, 4])}`}
                </Button>
              ) : (
                <Button
                  sx={{
                    textTransform: "unset",
                    bgcolor: "#512da8 !important",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                  variant="contained"
                  size="large"
                  onClick={connect}
                  className="btn"
                >
                  Connect Metamask
                </Button>
              )
            ) : (
              <Button
                onClick={handleDiscordLogin}
                sx={{
                  textTransform: "unset",
                  mr: "20px",
                  bgcolor: "#512da8 !important",
                  fontSize: "16px",
                  fontWeight: "bold",
                  p: "10px",
                }}
                variant="contained"
                size="large"
                className="btn"
              >
                Login With Discord
              </Button>
            )
          ) : walletFlag === "s" ? (
            disData ? (
              <Box sx={{ flexGrow: 0 }}>
                <WalletModalProvider>
                  <WalletModalProvider>
                    <WalletMultiButton />
                  </WalletModalProvider>
                </WalletModalProvider>
              </Box>
            ) : (
              <Button
                onClick={handleDiscordLogin}
                sx={{
                  textTransform: "unset",
                  mr: "20px",
                  bgcolor: "#512da8 !important",
                  fontSize: "16px",
                  fontWeight: "bold",
                  p: "10px",
                }}
                variant="contained"
                size="large"
                className="btn"
              >
                Login With Discord
              </Button>
            )
          ) : disData ? (
            <Box sx={{ flexGrow: 0 }}>
              <WalletModalProvider>
                <WalletModalProvider>
                  <WalletMultiButton />
                </WalletModalProvider>
              </WalletModalProvider>
            </Box>
          ) : (
            <Button
              onClick={handleDiscordLogin}
              sx={{
                textTransform: "unset",
                mr: "20px",
                bgcolor: "#512da8 !important",
                fontSize: "16px",
                fontWeight: "bold",
                p: "10px",
              }}
              variant="contained"
              size="large"
              className="btn"
            >
              Login With Discord
            </Button>
          )}
        </Box>
      </AppBar>
      <Box className="mmt80 rdc-pd-m" sx={{ flexGrow: 1, pt: 11 }}>
        <Outlet />
      </Box>
      <Box sx={{ p: 6, bgcolor: "rgba(18, 20, 24, 1)" }}>
        <div style={{ borderBottom: "1px solid gray", display: "flex" }}>
          <Grid container spacing={2}>
            <Grid item sm={12} md={8} lg={8}>
              <div
                style={{
                  marginLeft: "3em",
                }}
              >
                <img
                  src={footerLogo}
                  style={{ width: "100%", maxWidth: "320px" }}
                />
                <br />
                <br />
                <br />
                <span style={{ color: "white" }}>
                  Powered By Nearverse Labs
                </span>
                <br />
                <br />
                <IconButton
                  onClick={() => {
                    window.open("https://twitter.com/NEARverseLabs", "_blank");
                  }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    window.open(
                      "https://discord.com/invite/rocketbois",
                      "_blank"
                    );
                  }}
                >
                  <Icon>
                    <img
                      src={discordIcon}
                      alt="DiscordIcon"
                      style={{
                        width: "100%",
                      }}
                    />
                  </Icon>
                </IconButton>
              </div>
            </Grid>
            <Grid item sm={12} md={4} lg={4} sx={{ width: "100%" }}>
              <div
                style={{
                  flex: "1",
                  display: "flex",
                  color: "rgba(255, 255, 255, 1)",
                  width: "100%",
                }}
              >
                <div style={{ flex: "1" }}></div>
                <div>
                  <h2>Cynic Society</h2>
                  <h4>Home</h4>
                  <h4>Our Product</h4>
                  <h4>About Us</h4>
                  <h4>Contact Us</h4>
                </div>
                {/* <div style={{ flex: "1" }}>
                  <div style={{ flex: "1" }}>
                    <h2>Degen Town</h2>
                    <h4>Raffles</h4>
                    <h4>Coin Flip</h4>
                  </div>
                </div> */}
              </div>
            </Grid>
          </Grid>
        </div>
        <div
          style={{
            textAlign: "center",
            color: "rgba(255, 255, 255, 1)",
            marginTop: "25px",
          }}
        >
          © 2022 cynic social. All rights reserved
        </div>
      </Box>
    </Box>
  );
}
