class DaoGeneralPage {
  constructor() {
    if (!this.itti) {
      DaoGeneralPage.prototype.itti = new IttiContract();
    }
  }

  _setAccount(account) {
    let newAccount = typeof account === 'string' ? account : '';
    if (newAccount.length > 13) {
      newAccount = newAccount.slice(0, 6) + '...' + newAccount.slice(-4);
    }
    const actNot = $('.connect-wallet');
    const actOkLi = $('.wallet-account-li');
    const actOk = $('.wallet-account');
    actOk.text(newAccount);
    actNot.attr('style', 'display: none !important;');
    !actOk.is(':visible') && actOk.show();
    actOkLi.show();
    $('.only-show-on-mobile-login').show();
    /*const actOk = $('.wallet-account');
    actOk.text(newAccount);
    actNot.remove();
    actOk.show();*/
  }

  connect() {
    const _this = this;
    BaseContract.connectWallet()
        .then(res => {
          _this._setAccount(ethereum.selectedAddress);
          CommonPage.setInviterAddress();
          const selfAddr = ethereum.selectedAddress;
          if (selfAddr) {
            _this.itti.nodeMappings(selfAddr).then(selfInfo => {
              console.log('dao selfInfo:', selfInfo);
              if (selfInfo._type === 'sale') {
                $('.invitation-section').show();
                new CommonPage().setInvitationLink('dao');
              }
            });
          }
        })
        .catch(err => {
          if (err.code != 4001) {
            new CommonPage().showError(err.message);
            console.error('连接钱包失败:', err);
          }
        });
  }

  /**
   * 购买认购资格
   * @param inviter 邀请人账户地址
   * @return {Promise<void>}
   */
  async getQualification(inviter) {
    const btnClassname = 'buy-eligibility-btn'
    if (Utils.isBtnLoading(btnClassname)) {
      return;
    }
    Utils.setBtnLoading(btnClassname);
    try {
      const res = await this.itti.qualify(inviter);
      res !== false && new CommonPage().showSuccess('You are a DAO General now!');
      // CommonPage.setInviterAddress();
      this.connect();
    } catch (err) {
      if (err && err.receipt && err.receipt.status === false) {
        const {browserBaseUrl} = getConfig();
        const errMsg = `
          The subscription failed, please check the transaction details from the blockchain browser
          <a href="${browserBaseUrl + err.receipt.transactionHash}" target="_blank"> ${err.receipt.transactionHash} </a>
        `
        new CommonPage().showError(errMsg || 'Subscription failed');
      } else {
        new CommonPage().showError(err.message || 'Subscription failed');
      }
      console.error('getQualification err:', err)
    } finally {
      Utils.resetBtnLoading(btnClassname);
    }
  }

  inviteNow() {
    const inviteLink = this.itti.inviteLinks.dao;
    Utils.copyText('invite-now-btn', inviteLink).then(res => {
      // new CommonPage().showSuccess(inviteLink, 'Invitation link copied!');
    });
  }
}

function initDaoGeneralPage() {
  const btnConnect = $('.connect-wallet');
  const btnBuy = $('.buy-eligibility-btn');
  const btnInvite = $('.invite-now-btn');

  const daoPage = new DaoGeneralPage();
  daoPage.connect();

  btnConnect.on('click', function () {
    daoPage.connect();
  });
  btnBuy.on('click', function () {
    const {inviter} = Utils.parseSearch();
    daoPage.getQualification(inviter);
  });
  btnInvite.on('click', function () {
    daoPage.inviteNow();
  });
}

$(document).ready(function () {
  console.log('abc dao ready')
  initDaoGeneralPage();
});
