function getConfig() {
  return {
    /*chainId: '0x5',
    chainName: 'Goerli Test Network',
    browserBaseUrl: 'https://goerli.etherscan.io/tx/',*/
    chainId: '0x38',
    chainName: 'BNB Smart Chain Mainnet',
    browserBaseUrl: 'https://bscscan.com/tx/',
    ittiContract: {
      address: '0x4fC7e2D36C84D90aa70230512a7Bb38bc99E1964',
      abi: getIttiAbi(),
      homeInviteBaseUrl: `${location.origin}/index.html?inviter=`,
      daoInviteBaseUrl: `${location.origin}/dao-general.html?inviter=`,
    },
    usdtContract: {
      address: '0x55d398326f99059fF775485246999027B3197955',
      abi: getUsdtAbi(),
    },
  }
}
