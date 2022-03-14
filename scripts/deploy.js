const Web3 = require("web3");
const Greeter = require("../artifacts/contracts/Greeter.sol/Greeter.json");

const endpoint = process.env.NODE_ADDRESS;
const hexPrivateKey = process.env.PRIVATE_KEY;

async function sendTransaction(web3, chainId, account, data, nonce) {
  const tx = {
    type: 2,
    nonce,
    maxPriorityFeePerGas: 250, // Recommended maxPriorityFeePerGas
    maxFeePerGas: 250, // Recommended maxFeePerGas
    gasLimit: web3.utils.stringToHex("21000"), // basic transaction costs exactly 21000
    chainId, // Ethereum network id
    data,
  };
  const transaction = await account.signTransaction(tx);
  return web3.eth.sendSignedTransaction(transaction.rawTransaction);
}

(async () => {
  const options = { timeout: 1000 * 30 };
  const web3 = new Web3(new Web3.providers.HttpProvider(endpoint, options));
  const account = web3.eth.accounts.privateKeyToAccount(hexPrivateKey);

  const chainId = await web3.eth.getChainId();
  let nonce = (await web3.eth.getTransactionCount(account.address)) + 1;

  const contractAddress = {
    Greeter: "",
    Greeter_TX_HASH: "",
    InitCodeHash:
      "0xfe5c25035eb1580fcbc8496a5d5423870718fac54c9d582b43039dbce6afc72f",
  };

  // deploy Greeter contract
  {
    const contract = new web3.eth.Contract(Greeter.abi);
    const data = contract
      .deploy({ data: Greeter.bytecode, arguments: ["hello"] })
      .encodeABI();
    const receipt = await sendTransaction(web3, chainId, account, data, nonce);
    nonce += 1;
    contractAddress.Greeter = receipt.contractAddress;
    contractAddress.Greeter_TX_HASH = receipt.transactionHash;
  }
  console.log("contract res: ", contractAddress);
})();
