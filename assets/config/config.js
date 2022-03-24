function getConfig() {
  return {
    /*chainId: '0x5',
    chainName: 'Goerli Test Network',
    browserBaseUrl: 'https://goerli.etherscan.io/tx/',*/
    chainId: '0x38',
    chainName: 'BNB Smart Chain Mainnet',
    browserBaseUrl: 'https://bscscan.com/tx/',
    ittiContract: {
      address: '0xfa6b63Ae2372889B70E33B20FFBE79E5E9d0D588',
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
