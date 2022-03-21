function getConfig() {
  return {
    chainId: '0x5',
    chainName: 'Goerli Test Network',
    browserBaseUrl: 'https://goerli.etherscan.io/tx/',
    ittiContract: {
      address: '0xAc2599b342E72E38ed2A0Fa2732df1Ce81fC17E1',
      abi: getIttiAbi(),
      homeInviteBaseUrl: `https://devisadev.github.io/pages/index.html?inviter=`,
      daoInviteBaseUrl: `https://devisadev.github.io/pages/dao-general.html?inviter=`,
    },
    usdtContract: {
      address: '0x320e08c12e0A16A7118164750731537b99C92E9b',
      abi: getUsdtAbi(),
    },
  }
}
