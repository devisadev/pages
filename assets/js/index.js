class IndexPage {
  constructor() {
    if (!this.itti) {
      IndexPage.prototype.itti = new IttiContract();
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
  }

  connect() {
    const _this = this;
    BaseContract.connectWallet()
        .then(res => {
          _this._setAccount(ethereum.selectedAddress);
          CommonPage.setInviterAddress();
          const selfAddr = ethereum.selectedAddress;
          if (selfAddr) {
            const selfAllowed = {
              delegate: true,
              active: true,
            }
            _this.itti.nodeMappings(selfAddr).then(selfInfo => {
              if (selfAllowed[selfInfo._type]) {
                $('.invitation-section').show();
                new CommonPage().setInvitationLink('home');
              }
            });
          }
        })
        .catch(err => {
          if (err.code != 4001) {
            new CommonPage().showError(err.message || err.msg);
            console.error('连接钱包失败:', err);
          }
        });
  }

  /**
   * 激活账户，绑定关系
   * @param inviter 邀请人账户地址
   * @return {Promise<void>}
   */
  async activeAccount(inviter) {
    const btnClassname = 'buy-eligibility-btn'
    if (Utils.isBtnLoading(btnClassname)) {
      return;
    }
    Utils.setBtnLoading(btnClassname);
    try {
      const res = await this.itti.activateAddress(inviter);
      res !== false && new CommonPage().showSuccess('Account activated successfully!');
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
        new CommonPage().showError(err.message || err.msg || 'Subscription failed');
      }
      console.error('getQualification err:', err)
    } finally {
      Utils.resetBtnLoading(btnClassname);
    }
  }

  inviteNow() {
    const inviteLink = this.itti.inviteLinks.home;
    Utils.copyText('invite-now-btn', inviteLink).then(res => {
      // new CommonPage().showSuccess(inviteLink, 'Invitation link copied!');
    });
  }
}

async function initHomePage() {
  const btnConnect = $('.connect-wallet');
  const btnBuy = $('.buy-eligibility-btn');
  const btnInvite = $('.invite-now-btn');

  const indexPage = new IndexPage();
  indexPage.connect();

  btnConnect.on('click', function () {
    indexPage.connect();
  });
  btnBuy.on('click', function () {
    const {inviter} = Utils.parseSearch();
    indexPage.activeAccount(inviter);
  });
  btnInvite.on('click', function () {
    indexPage.inviteNow();
  });
}

$(document).ready(function () {
  initHomePage();
});
