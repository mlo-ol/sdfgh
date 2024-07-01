import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);
  const [resumed, setResumed] = useState(false);

  const contractAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
    }

    const deposit = async () => {
      if (atm) {
        try {
          let tx = await atm.deposit(1);
          await tx.wait();
          getBalance();
          setError(""); // Clear any previous error
        } catch (error) {
          console.error("Error depositing funds:", error.message);
          setError(error.message); // Set the error message
        }
      }
    };
    

    const withdraw = async () => {
      if (atm) {
        try {
          let tx = await atm.withdraw(1);
          await tx.wait();
          getBalance();
          setError(""); // Clear any previous error
        } catch (error) {
          console.error("Error withdrawing funds:", error.message);
          setError(error.message); // Set the error message
        }
      }
    };

  const pauseContract = async () => {
    if (atm) {
      try {
        let tx = await atm.pauseContract();
        await tx.wait();
        setPaused(true);
        setResumed(false);
        console.log("Contract paused");
        setError("");
      } catch (error) {
        console.error("Error pausing contract:", error.message);
        setError(error.message);
      }
    }
  };

  const resumeContract = async () => {
    if (atm) {
      try {
        let tx = await atm.resumeContract();
        await tx.wait();
        setPaused(false);
        setResumed(true);
        console.log("Contract resumed");
        setError(""); 
      } catch (error) {
        console.error("Error resuming contract:", error.message);
        setError(error.message);
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <button onClick={pauseContract}>Pause Contract</button>
        <button onClick={resumeContract}>Resume Contract</button>
        {paused && <p>Contract is Paused</p>}
        {resumed && <p>Contract is Resumed</p>}
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
