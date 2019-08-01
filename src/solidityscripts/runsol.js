const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

//Connecting to web3 provider
// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

//Reading solidity file
const input = fs.readFileSync('./src/solidityscripts/contracts/test.sol').toString();
const output = solc.compile(input, 1);
const bytecode = output.contracts[':' + process.argv[2]].bytecode;
const abi = JSON.parse(output.contracts[':' + process.argv[2]].interface);

// Contract object
const contract = web3.eth.contract(abi);

// Deploy contract instance
const contractInstance = contract.new({
    data: '0x' + bytecode,
    from: web3.eth.coinbase,
    gas: 6721975
}, (err, res) => {
    if (err) {
        console.log(err);
        return;
    }
    // If we have an address property, the contract was deployed
    if (res.address) {
        fs.appendFile('./src/solidityscripts/contracts/output.txt', process.argv[2] + ':' + res.address, function(err, result) {
            if(err) console.log('error', err);
          });
        return res.address;
    }
});