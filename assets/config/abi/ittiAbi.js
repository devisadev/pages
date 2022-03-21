function getIttiAbi() {
  return [{
    "inputs": [],
    "name": "_fixedDelegatePrice",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
    {
      "inputs": [{
        "internalType": "address",
        "name": "inviterAddress",
        "type": "address"
      }],
      "name": "applyForDelegate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{
        "internalType": "uint256",
        "name": "usdtAmount",
        "type": "uint256"
      }],
      "name": "enchangeTokenWithUsdt",
      "outputs": [{
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_currentPrice_numerator",
      "outputs": [{
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_currentPrice_denominator",
      "outputs": [{
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "_nodeMappings",
      "outputs": [
        {
          "internalType": "address",
          "name": "_inviter",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_type",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "inviter",
          "type": "address"
        }
      ],
      "name": "activateAddress",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
  ];
}
