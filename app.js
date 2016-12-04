/**
 * Created by hao on 16-11-30.
 */
(function() {
    document.querySelectorAll("textarea").forEach(function(txarea) {
        txarea.setAttribute("autocomplete","off");
        txarea.setAttribute("autocorrect", "off")
        txarea.setAttribute("autocapitalize", "off")
        txarea.setAttribute("spellcheck", "false")
        txarea.onfocus = function () {
            this.setSelectionRange(0, this.value.length)
        }
    });

    var msgs = {
        requiredAction: "请选定一种操作",
        requiredPsw: "请输入密码",
        requiredInput: "请输入需要转换的内容",
        requiredPub: "缺少公钥",
        requiredPri: "缺少私钥",
        requiredSgn: "需要提供签名加密文本",

        signValidated: "签名认证成功",
        signNonValidated: "签名认证不通过"
    }
    var rsaKey = null;

    var symEncrp = document.querySelector('div#symEncrp');
    var ppEncrp = document.querySelector('div#ppEncrp');
    var signEncrp = document.querySelector('div#signVld');
    var menuWrapper = document.querySelector('div.menuWrapper')
    var genPPButton = document.querySelector("button.genPP")
    var publicTa = ppEncrp.querySelector("textarea.publicKey");
    var privateTa = ppEncrp.querySelector("textarea.privateKey");

    menuWrapper.querySelectorAll("a").forEach(function(alias) {
        alias.onclick = function() {
            alias.className="highlight"
            menuWrapper.querySelectorAll("a").forEach(function(anotherAlias) {
                if(anotherAlias!=alias) {
                    anotherAlias.className = ' '
                }
            })
        }
    })

    var errorBox = document.querySelector('div#errorBox');
    var locationHash = window.location.hash;
    if(locationHash == '') {
        menuWrapper.querySelector("a").click()
    } else {
        var activeItem = menuWrapper.querySelector("a."+ locationHash.replace('#',''));
        if(activeItem) {
            activeItem.click()
        }
    }

    symEncrp.querySelector("button.submit").onclick = function() {
        errorBox.innerHTML = ''
        var errors = [];
        var action = symEncrp.querySelector("input[name='actionSym']:checked");
        if(!action) {
            errors.push(msgs.requiredAction);
        }
        var psw = symEncrp.querySelector("input.psw").value;
        if(!psw) {
            errors.push(msgs.requiredPsw);
        }
        var inputValue = symEncrp.querySelector("textarea.input").value;
        if(!inputValue) {
            errors.push(msgs.requiredInput);
        }
        var outputTa = symEncrp.querySelector("textarea.output");
        if(errors.length < 1) {
            if(action.value=="en") {
                outputTa.value = CryptoJS.AES.encrypt(inputValue, psw);
            } else {
                outputTa.value = CryptoJS.AES.decrypt(inputValue, psw).toString(CryptoJS.enc.Utf8);
            }
            outputTa.focus()
            outputTa.setSelectionRange(0, outputTa.value.length)
        } else {
            errors.forEach(function(error) {
                errorBox.insertAdjacentHTML("beforeend", error + "<br/>")
            })
        }
    }

    ppEncrp.querySelector("button.submit").onclick = function() {
        errorBox.innerHTML = ''
        var errors = []
        var action = ppEncrp.querySelector("input[name='actionPP']:checked");
        if(!action) {
            errors.push(msgs.requiredAction);
        }
        var inputValue = ppEncrp.querySelector("textarea.input").value;
        if(!inputValue) {
            errors.push(msgs.requiredInput)
        }
        var outputTa = ppEncrp.querySelector("textarea.output");

        if(errors.length < 1) {
            if(action.value=="en") {
                if(!publicTa.value) {
                    errorBox.innerHTML = ''
                    errorBox.insertAdjacentHTML("beforeend", msgs.requiredPub)
                } else {
                    var crypt = new JSEncrypt();
                    crypt.setPublicKey(publicTa.value)
                    outputTa.value = crypt.encrypt(inputValue)
                }
            } else {
                if(!privateTa.value) {
                    errorBox.innerHTML = ''
                    errorBox.insertAdjacentText("beforeend", msgs.requiredPri)
                } else {
                    var crypt = new JSEncrypt();
                    crypt.setPrivateKey(privateTa.value)
                    outputTa.value = crypt.decrypt(inputValue)
                }
            }
        } else {
            errors.forEach(function(error) {
                errorBox.insertAdjacentHTML("beforeend", error + "<br/>")
            })
        }
    }
    genPPButton.onclick = function() {
        var crypt = new JSEncrypt({default_key_size: 1024})
        crypt.getKey()
        publicTa.value = crypt.getPublicKey()
        privateTa.value = crypt.getPrivateKey()
    }
    signEncrp.querySelector("button.submit").onclick = function() {
        var pubKeyTa = signEncrp.querySelector("textarea.pubKey")
        var prvKeyTa = signEncrp.querySelector("textarea.prvKey")
        errorBox.innerHTML = ''
        var errors = []
        var action = signEncrp.querySelector("input[name='actionSn']:checked");
        if(!action) {
            errors.push(msgs.requiredAction)
        }
        var inputValue = signEncrp.querySelector("textarea.input").value;
        var outputTa = signEncrp.querySelector("textarea.output");
        if(!inputValue) {
            errors.push(msgs.requiredInput)
        }
        if(errors.length < 1) {
            if(action.value == 'gen') {
                if(!pubKeyTa.value) {
                    var crypt = new JSEncrypt({default_key_size: 1024})
                    crypt.getKey();
                    pubKeyTa.value = crypt.getPublicKey()
                    prvKeyTa.value = crypt.getPrivateKey()
                }
                var orgMD5Value = CryptoJS.MD5(inputValue).toString()
                var myEncrypt = new JSEncrypt()
                myEncrypt.setPublicKey(pubKeyTa.value)
                outputTa.value = myEncrypt.encrypt(orgMD5Value)

            } else {
                if(!outputTa.value) {
                    errorBox.insertAdjacentHTML("beforeend", msgs.requiredSgn + "<br/>")
                } else {
                    if(!prvKeyTa.value) {
                        errorBox.insertAdjacentHTML("beforeend", msgs.requiredPri + "<br/>")
                    } else {
                        var myDecrypt = new JSEncrypt()
                        myDecrypt.setPrivateKey(prvKeyTa.value)
                        var testMD5Value = CryptoJS.MD5(inputValue).toString()
                        var decryptedMD5Value = myDecrypt.decrypt(outputTa.value)
                        if(testMD5Value == decryptedMD5Value) {
                            alert(msgs.signValidated)
                        } else {
                            alert(msgs.signNonValidated)
                        }
                    }
                }
            }
        } else {
            errors.forEach(function(error) {
                errorBox.insertAdjacentHTML("beforeend", error + "<br/>")
            })
        }
    }
})();