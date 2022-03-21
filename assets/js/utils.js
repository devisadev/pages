class Utils {
  static parseSearch() {
    let search = location.search;
    search = search.slice(1);
    return search.split('&').reduce((prev, cur) => {
      const [k, v] = cur.split('=');
      prev[k] = v;
      return prev;
    }, {})
  }

  static async copyText(btnClassname, text) {
    const btn = document.getElementsByClassName(btnClassname)[0];
    btn.setAttribute('data-clipboard-text', text);
    const clipboard = new ClipboardJS(`.${btnClassname}`);
    clipboard.on("success", function (e) {
      e.clearSelection();
      clipboard.destroy();
      return Promise.resolve(1);
    });
  }

  static setBtnLoading(btnClassname) {
    if (Utils.isBtnLoading(btnClassname)) {
      return;
    }
    const btn = $(`.${btnClassname}`);
    btn.prepend(`
      <div style="width: 1.5rem; height: 1.5rem;" class="spinner-border" role="status">
        <span class="visually-hidden"></span>
      </div>
    `);
    btn.attr('disabled', true);
  }

  static resetBtnLoading(btnClassname) {
    if (!Utils.isBtnLoading(btnClassname)) {
      return;
    }
    const btn = $(`.${btnClassname}`);
    btn.children('.spinner-border').remove();
    btn.attr('disabled', false);
  }

  static isBtnLoading(btnClassname) {
    return $(`.${btnClassname}`).attr('disabled');
  }
}
