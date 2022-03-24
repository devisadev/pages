class ExchangePage {

  constructor() {
    if (!this.itti) {
      ExchangePage.prototype.itti = new IttiContract();
    }
    if (!this.usdt) {
      ExchangePage.prototype.usdt = new UsdtContract();
    }
    this.exchangeRate = 1;
  }

  /*_setAccount(account) {
    let newAccount = typeof account === 'string' ? account : '';
    if (newAccount.length > 13) {
      newAccount = newAccount.slice(0, 6) + ' ***** ' + newAccount.slice(-4);
    }
    $('#input-account').val(newAccount);
  }*/

  /*connect() {
    const _this = this;
    BaseContract.connectWallet()
        .then(res => {
          _this._setAccount(ethereum.selectedAddress);
        })
        .catch(err => {
          if (err.code != 4001) {
            new CommonPage().showError(err.message || err.msg);
            console.error('连接钱包失败:', err);
          }
        });
  }*/

  fixAmount(val) {
    if (!val) return val;
    const accuracy = Math.pow(10, 6);
    return Math.round(val * accuracy) / accuracy;
  }

  bindAmount() {
    const _this = this;
    const usdtAmt = $('#usdt-amount');
    const ittiAmt = $('#itti-amount');
    const warnInfo = $('#amount-zero-warning');
    usdtAmt.on('input', function () {
      // console.log('usdt input:', $(this).val() / _this.exchangeRate);
      const val = $(this).val() / _this.exchangeRate || $(this).val()
      ittiAmt.val(_this.fixAmount(val));
      if (!(val > 0)) {
        warnInfo.slideDown();
      } else {
        warnInfo.slideUp();
      }
    });
    ittiAmt.on('input', function () {
      // console.log('itti input:', $(this).val() * _this.exchangeRate);
      const val = $(this).val() * _this.exchangeRate || $(this).val()
      usdtAmt.val(_this.fixAmount(val));
      if (!(val > 0)) {
        warnInfo.slideDown();
      } else {
        warnInfo.slideUp();
      }
    });
  }

  // 换购
  async exchange() {
    const btnClassname = 'exchange-confirm-btn';
    if (Utils.isBtnLoading(btnClassname)) {
      return;
    }
    const usdtAmount = $('#usdt-amount').val();
    if (!(usdtAmount > 0)) {
      $('#amount-zero-warning').slideDown();
      return;
    }
    Utils.setBtnLoading(btnClassname);
    try {
      await this.itti.exchangeByUsdt(usdtAmount);
    } catch (err) {
      if (err && err.code != 4001) {
        new CommonPage().showError(err.message || err.msg || 'Subscription failed')
        console.error('getQualification err:', err)
      }
    } finally {
      Utils.resetBtnLoading(btnClassname);
    }
  }
}

async function initExchangeEvents() {
  const btnExchange = $('.exchange-confirm-btn');

  const exchange = new ExchangePage();
  exchange.exchangeRate = await exchange.itti.getPrice();
  // console.log('rate:', exchange.exchangeRate);
  // exchange.connect();
  exchange.bindAmount();

  btnExchange.on('click', function () {
    exchange.exchange();
  });
}

$(document).ready(function () {
  initExchangeEvents();
});
