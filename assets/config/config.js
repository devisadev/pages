function getConfig() {
  return {
    chainId: '0x5',
    chainName: 'Goerli Test Network',
    browserBaseUrl: 'https://goerli.etherscan.io/tx/',
    ittiContract: {
      address: '0x5f233DE7492F689C2799CEc56485F409Fc5abAEE',
      abi: getIttiAbi(),
      homeInviteBaseUrl: `${location.origin}/index.html?inviter=`,
      daoInviteBaseUrl: `${location.origin}/dao-general.html?inviter=`,
    },
    usdtContract: {
      address: '0x642A4d108266433471c41cf3b5006BE806eF9410',
      abi: getUsdtAbi(),
    },
  }
}
