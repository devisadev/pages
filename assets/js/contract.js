const config = getConfig();

let _usdtContract = undefined;
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

function _NewContract(jsonInterface, address) {
  return new web3.eth.Contract(jsonInterface, address);
}

class BaseContract {

  static async checkChain() {
    if (typeof window.ethereum === 'undefined') {
      return Promise.reject(new Error('You have not installed the wallet'));
    }
    if (ethereum._metamask) {
      const isUnlocked = await ethereum._metamask.isUnlocked();
      if (!isUnlocked) {
        return Promise.reject(new Error('Wallet has been locked'));
      }
    }
    // switch if not the right chain
    const {chainId} = config;
    if (ethereum.chainId != chainId) {
      return ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{
          chainId,
        }],
      });
    }
  }

  static async connectWallet() {
    try{
      await BaseContract.checkChain();
      return ethereum.request({
        method: 'eth_requestAccounts'
      });
    }catch(err){
      console.log('connect wallet err:', err);
      // return Promise.reject(new Error(`请切换到 ${config.chainName}`))
      return Promise.reject(err);
    }
  }
}

class UsdtContract extends BaseContract {
  constructor() {
    super();
    const {
      abi,
      address
    } = config.usdtContract;
    UsdtContract.prototype.contract = _NewContract(abi, address);
  }

  // approve
  async approve(spender, amount) {
    const spenderOk = validator.isEthereumAddress(spender + '');
    const amountOk = amount > 0;
    if (!spenderOk || !amountOk) {
      const errMsg = !spenderOk ? 'spender address format is incorrect' : 'Approving amount is wrong';
      return Promise.reject(new Error(errMsg))
    }
    return this.contract.methods.approve(spender, amount).send({
      from: ethereum.selectedAddress,
    });
  }
}

class IttiContract extends BaseContract {
  constructor() {
    super();
    const {
      abi,
      address
    } = config.ittiContract;
    IttiContract.prototype.contract = _NewContract(abi, address);
  }

  async getUsdtApprove(amount) {
    if (!_usdtContract) {
      _usdtContract = new UsdtContract();
    }
    const {address} = config.ittiContract;
    return _usdtContract.approve(address, amount);
  }

  // 认购白名单
  async qualify(inviter, onApproving, onApproved) {
    if (!validator.isEthereumAddress(inviter + '')) {
      return Promise.reject(new Error(`The inviter's account format is incorrect`));
    }
    if (!ethereum || !ethereum.selectedAddress) {
      return Promise.reject(new Error('Wallet not yet connected'));
    }
    if (inviter.toLowerCase() === ethereum.selectedAddress.toLowerCase()) {
      return Promise.reject(new Error('The inviter and the registered account cannot be the same'));
    }
    const inviterInfo = await this.nodeMappings(inviter);
    const allowedInviterType = {
      sale: true,
    }
    if (!allowedInviterType[inviterInfo._type]) {
      return Promise.reject(new Error(`Inviter's account is not allowed to complete the action`));
    }
    const selfInfo = await this.nodeMappings(ethereum.selectedAddress);
    if (selfInfo._type) { // delegate or not empty
      return Promise.reject(new Error('Your account is not allowed to complete the action'));
    }
    try{
      typeof onApproving === 'function' && onApproving();
      const fixedPrice = await this.contract.methods._fixedDelegatePrice().call();
      await this.getUsdtApprove(fixedPrice);
      typeof onApproved === 'function' && onApproved();
      await this.contract.methods.applyForDelegate(inviter).send({
        from: ethereum.selectedAddress,
      });
    }catch(err){
      console.error('ittiContract.qualify err:', err);
      if (err.code != 4001) {
        return Promise.reject(err);
      }
      return Promise.resolve(false);
    }
  }

  get inviteLinks() {
    const {homeInviteBaseUrl, daoInviteBaseUrl} = config.ittiContract;
    return {
      home: `${homeInviteBaseUrl}${ethereum.selectedAddress}`,
      dao: `${daoInviteBaseUrl}${ethereum.selectedAddress}`,
    };
  }

  async getPrice() {
    const n = await this.contract.methods._currentPrice_numerator().call({from: ethereum.selectedAddress});
    const m = await this.contract.methods._currentPrice_denominator().call({from: ethereum.selectedAddress});
    // console.log('n, m:', n, m);
    return n / m;
  }

  /**
   * get user account mapping
   * @param account 用户地址
   * @return {Promise<{_inviter: string, _type: string}>} 邀请人和身份类型
   */
  async nodeMappings(account) {
    return this.contract.methods._nodeMappings(account).call({from: ethereum.selectedAddress});
  }

  /**
   * 激活账号
   * @param inviter 邀请人，类型必须是 "delegate"
   * @return {Promise<boolean>}
   */
  async activateAddress(inviter) {
    if (!validator.isEthereumAddress(inviter + '')) {
      return Promise.reject(new Error(`'The inviter's account format is incorrect'`));
    }
    if (!ethereum || !ethereum.selectedAddress) {
      return Promise.reject(new Error('Wallet not yet connected'));
    }
    if (inviter.toLowerCase() === ethereum.selectedAddress.toLowerCase()) {
      return Promise.reject(new Error('The inviter and the registered account cannot be the same'));
    }
    const inviterInfo = await this.nodeMappings(inviter);
    const allowedInviterType = {
      delegate: true,
      active: true,
    }
    if (!allowedInviterType[inviterInfo._type]) {
      return Promise.reject(new Error(`Inviter's account is not allowed to complete the action`));
    }
    const selfInfo = await this.nodeMappings(ethereum.selectedAddress);
    if (selfInfo._type) { // 'active' or other
      return Promise.reject(new Error('Your account is not allowed to complete the action'));
    }
    try{
      await this.contract.methods.activateAddress(inviter).send({
        from: ethereum.selectedAddress,
      });
    }catch(err){
      console.error('ittiContract.activateAddress err:', err);
      if (err.code != 4001) {
        return Promise.reject(err);
      }
      return Promise.resolve(false);
    }
  }

  // 换购
  async exchangeByUsdt(usdtAmount, onApproving, onApproved) {
    const selfInfo = await this.nodeMappings(ethereum.selectedAddress);
    const selfAllowed = {
      delegate: true,
      active: true,
    }
    if (!selfAllowed[selfInfo._type]) {
      return Promise.reject(new Error('Your account is not allowed to complete the action'));
    }
    const amountOk = usdtAmount > 0;
    if (!amountOk) {
      return Promise.reject(new Error('The USDT amount needs to be greater than 0'));
    }
    const amount = web3.utils.toWei(usdtAmount.toString(), 'ether');
    try{
      typeof onApproving === 'function' && onApproving();
      await this.getUsdtApprove(amount);
      typeof onApproved === 'function' && onApproved();
      await this.contract.methods.enchangeTokenWithUsdt(amount).send({
        from: ethereum.selectedAddress,
      });
    }catch(err){
      console.error('ittiContract.exchangeByUsdt err:', err);
      if (err.code == 4001) {
        return Promise.resolve(false);
      }
      if (err && err.message) {
        return Promise.reject(err);
      }
      return Promise.reject(new Error('The redemption failed, please check the transaction details from the blockchain browser'));
    }
  }
}
