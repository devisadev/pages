(function importLibs() {
  const bd = $('body')
  bd.append(`<script src="assets/libs/clipboard.min.js"></script>`);
  bd.append(`<script src="assets/config/abi/ittiAbi.js"></script>`);
  bd.append(`<script src="assets/config/abi/usdtAbi.js"></script>`);
  bd.append(`<script src="assets/config/config.js"></script>`);
  bd.append(`<script src="assets/js/contract.js"></script>`);
  bd.append(`<script src="assets/js/utils.js"></script>`);
})();

class CommonPage {

  constructor() {
    if (!this.itti) {
      CommonPage.prototype.itti = new IttiContract();
    }
  }

  static async setInviterAddress() {
    const itti = new IttiContract();
    const {inviter} = Utils.parseSearch();
    $('#inviter-address').text(inviter || '--');
    const selfAddr = ethereum.selectedAddress;
    $('#self-address').text(selfAddr || '--');

    /*if (inviter) {
      itti.nodeMappings(inviter).then(inviterInfo => {
        $('#inviter-type').text(inviterInfo._type || '--');
        // console.log('inv:', inviterInfo);
      });
    }*/

    if (selfAddr) {
      itti.nodeMappings(selfAddr).then(selfInfo => {
        // 首页
        if (selfInfo._type === 'delegate' || selfInfo._type === 'active') {
          $('#active-info').text('Your account is already activated');
          $('.active-btn').attr('disabled', true);
        } else if (selfInfo._type) {
          $('#active-info').text('Your account is not allowed to complete the action');
          $('.active-btn').attr('disabled', true);
        }
        // $('#self-type').text(selfInfo._type || '--');
        // console.log('self:', selfInfo);

        // dao页面
        if (selfInfo._type === 'sale') {
          $('#dao-active-info').text('You have already become a Dao General');
          $('.dao-purchase-btn').attr('disabled', true);
        } else if (selfInfo._type) {
          $('#dao-active-info').text('Your account is not allowed to complete the action');
          $('.dao-purchase-btn').attr('disabled', true);
        }
      });
    }
  }

  static goToPage(type) {
    let toUrl = location.origin;
    switch (type) {
      case 'home':
        toUrl += ('/index.html' + location.search);
        break
      case 'dao':
        toUrl += ('/dao-general.html' + location.search);
        break
      default:
        toUrl += ('/index.html' + location.search);
        break
    }
    window.location.href = toUrl;
  }

  setInvitationLink(type) {
    let link;
    switch (type) {
      case 'home':
        link = this.itti.inviteLinks.home;
        break
      case 'dao':
        link = this.itti.inviteLinks.dao;
        break
      default:
        link = this.itti.inviteLinks.home;
        break
    }
    $('#user-invitation').text(link);
  }

  setCopyrightYear() {
    $('.my-copyright-year').text(new Date().getFullYear());
  }

  static logout() {
    console.log('退出登录')
    const actNot = $('.connect-wallet');
    const actOkLi = $('.wallet-account-li');
    actOkLi.attr('style', 'display: none !important;');
    $('.only-show-on-mobile-login').attr('style', 'display: none !important;');
    actNot.show();
  }

  appendModal() {
    $('body').prepend(`
      <!-- Modal -->
      <div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bg-dark">
            <div class="modal-header" style="border-bottom-color: #13223a">
              <h5 class="modal-title text-white" id="myModalLabel">Success!</h5>
            </div>
            <div class="modal-body text-white" style="word-wrap: break-word;word-break: break-all;">
              Unknown error
            </div>
            <div class="modal-footer" style="border-top-color: #13223a">
              <button type="button" class="btn btn-info close-my-modal" data-bs-dismiss="modal">Close</button>
<!--              <button type="button" class="btn btn-primary">Save changes</button>-->
            </div>
          </div>
        </div>
      </div>
    `);
    CommonPage.prototype.myModal = new bootstrap.Modal(document.getElementById('myModal'));
    const _this = this;
    $('.close-my-modal').click(function () {
      _this.myModal.hide();
    })
  }

  showSuccess(message, title) {
    if (!this.myModal) {
      this.appendModal();
    }
    $('#myModal #myModalLabel').text(title || 'Success!');
    $('#myModal .modal-body').text(message);
    this.myModal.show();
  }

  showError(errMessage, errTitle) {
    if (!this.myModal) {
      this.appendModal();
    }
    $('#myModal #myModalLabel').text(errTitle || 'Error!');
    $('#myModal .modal-body').html(errMessage);
    this.myModal.show();
  }
}

$(document).ready(function () {
  const commonPage = new CommonPage();
  commonPage.setCopyrightYear();
  ethereum && ethereum.on('accountsChanged', (accounts) => {
    window.location.reload();
  });
});
