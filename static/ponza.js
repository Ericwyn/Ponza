let page;
let server;
let key;
let commData;
const pageShowNum = 7;
let pageNum;

function Ponza(domId,option){
    page = option.page;
    server = option.server;
    key = option.key;
    // 获取 scritp 文件
    document.getElementById(domId).innerHTML +=
        `<div class="ponza-main">
        <!--这里放留言的列表-->
        <div id="ponza-comm-list">

        </div>
        <div class="ponza-page-change ponza-page-change-box"></div>

        <!--这里放留言的输入框-->
        <div class="ponza-editor gradient-wrapper">
            <div class="ponza-editor-nav">
                <div class="ponza-copyright">
                    <p >Comment system powered by <a class="ponza-copyright-href" href="https://github.com/Ericwyn/Ponza">Ponza</a></p>
                </div>
                <div class="ponza-editor-error" id="ponza-editor-error"></div>
            </div>

            <div class="ponza-editor-body">
                <div style="box-sizing: border-box;">
                    <textarea placeholder="请在此留言" id="ponza-input-comm"></textarea>
                </div>
            </div>
        </div>

        <div class="ponza-user-set gradient-wrapper">
            <div style="display: inline">
                <input class="ponza-editor-input" id="ponza-input-name" placeholder="昵称">
                <input class="ponza-editor-input" id="ponza-input-site" placeholder="网址">
                <button class="ponza-editor-button" id="ponza-submit-btn" onclick="submit()">提 交</button>
            </div>
        </div>
    </div>`;
    getComm();

    if (localStorage.getItem("ponzaName") != null){
        document.getElementById("ponza-input-name").value = localStorage.getItem("ponzaName");
    }
    if (localStorage.getItem("ponzaSite") != null){
        document.getElementById("ponza-input-site").value = localStorage.getItem("ponzaSite");
    }
}

// 获取一篇文章的评论
function getComm(){
    ajax_post(
        server+"/api/getComm",
        [
            ["key", key],
            ["page",page],
        ],
        function (resp) {
            document.getElementById("ponza-comm-list").innerHTML = "";
            let json = JSON.parse(resp);
            // 如果还有 init 页面的话就先 init
            if (json.code === "4003") {
                initComm(function () {
                    getComm();
                });
            }else {
                // 将数据显示出来
                commData = json;
                // for (let i = json.comment.length-1; i >= 0;i--){
                //     let comm = json.comment[i];
                //     document.getElementById("ponza-comm-list").innerHTML
                //         += bindComment(comm.name, comm.time, comm.agent, comm.comm, comm.site);
                // }
                pageNum = commData.comment.length / pageShowNum;
                if (pageNum-parseInt(pageNum) > 0) {
                    pageNum = parseInt(pageNum) + 1;
                }else {
                    pageNum = parseInt(pageNum)
                }
                // 分页插件
                const slp = new SimplePagination(pageNum);
                slp.init({
                    container: '.ponza-page-change-box',
                    maxShowBtnCount: 3,
                    onPageChange:function (state) {
                        console.log(state.pageNumber);
                        loadCommPage(state.pageNumber)
                    },
                });

                loadCommPage(1);
            }
        },
        function (status) {
            console.log("ponza get comment error : "+status)
        }
    )
}

// 分页加载
function loadCommPage(pageNum) {
    document.getElementById("ponza-comm-list").innerHTML = "";
    for (let i=commData.comment.length-((pageNum-1)*pageShowNum)-1; i >= commData.comment.length-(pageNum*pageShowNum) && i >=0 ; i--){
        comm = commData.comment[i];
        document.getElementById("ponza-comm-list").innerHTML
            += bindComment(comm.name, comm.time, comm.agent, comm.comm, comm.site);
    }
}

// 初始化一篇文章的评论
function initComm(callback){
    ajax_post(
        server+"/api/initComm",
        [
            ["key", key],
            ["page",page],
        ],
        function (resp) {
            console.log(resp);
            callback();
        },
        function (status) {
            console.log("error : "+status)
        }
    )
}

// 上传一篇文章的评论
function uploadComm(comm, name, site){
    ajax_post(
        server+"/api/uploadComm",
        [
            ["key", key],
            ["page", page],
            ["comm", comm],
            ["name", name],
            ["site", site],
        ],
        function (resp) {
            let json = JSON.parse(resp);
            getComm();
        },
        function (status) {
            console.log("error : "+status)
        }
    )
}

// 绑定评论视图
function bindComment(name, time, agent, comm, site) {
    if (site.trim() != ""){
        if (!site.startsWith("https://") && !site.startsWith("http://")) {
            site = "http://" + site;
        }
        site = "href=\""+site+"\""
    }
    return `<div class="ponza-card gradient-wrapper">
                <div class="ponza-card-title">
                    <span style="font-weight: bold"><a ${site} >${name}</a></span> 在 ${time} 的评论，来自 ${agent}
                    <div class="ponza-card-like-btn">
                        <!--<svg class="ponza-card-like-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M25 39.7l-.6-.5C11.5 28.7 8 25 8 19c0-5 4-9 9-9 4.1 0 6.4 2.3 8 4.1 1.6-1.8 3.9-4.1 8-4.1 5 0 9 4 9 9 0 6-3.5 9.7-16.4 20.2l-.6.5zM17 12c-3.9 0-7 3.1-7 7 0 5.1 3.2 8.5 15 18.1 11.8-9.6 15-13 15-18.1 0-3.9-3.1-7-7-7-3.5 0-5.4 2.1-6.9 3.8L25 17.1l-1.1-1.3C22.4 14.1 20.5 12 17 12z"></path></svg>-->
                        <span></span>
                    </div>
                </div>
                <div class="ponza-card-body">
                    ${comm}
                </div>`
}

function submit() {
    let comm = document.getElementById("ponza-input-comm").value;
    let name = document.getElementById("ponza-input-name").value;
    let site = document.getElementById("ponza-input-site").value;
    let reg = /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*/;
    if (name.length > 20){
        name = name.substr(0,20);
    }
    if (site.length > 40){
        site = site.substr(0,40);
    }
    if (name.trim() == ""){
        document.getElementById("ponza-editor-error").innerHTML="请输入昵称";
        return
    }
    localStorage.setItem("ponzaName",name);
    if (site.trim() != ""){
        if (!reg.test(site)){
            document.getElementById("ponza-editor-error").innerHTML="个人网址错误";
            return
        }
        localStorage.setItem("ponzaSite",site);
    }

    if (comm.trim() == ""){
        document.getElementById("ponza-editor-error").innerHTML="无法提交空白评论";
        return
    }
    comm = comm.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp');
    if (!getLastSubmitTime()) {
        document.getElementById("ponza-editor-error").innerHTML="请求过快，稍后再试";
        return
    }
    uploadComm(comm,name,site);
    localStorage.setItem("ponzaLastTime",Date.parse(new Date()));
    document.getElementById("ponza-input-comm").value = "";
}

function getLastSubmitTime() {
    if (localStorage.getItem("ponzaLastTime") == null){
        return true
    }else {
        let timeStamp = localStorage.getItem("ponzaLastTime");
        if ((Date.parse(new Date()) - timeStamp) / 1000 > (60 * 3)){
            return true
        }else {
            return false
        }
    }
}


function ajax_post(url, params, success_callback, fail_callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    let formData = new FormData();
    if (params !== null) {
        for (let i = 0; i < params.length; i++) {
            formData.append(params[i][0],params[i][1])
        }
        xhr.send(formData);
    } else {
        xhr.send();
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                success_callback(xhr.responseText)
            } else {
                fail_callback(xhr.status)
            }
        }
    }
}

// --------------------------------------- 下面的 JS 都是为了实现分页
class SimplePagination {
    constructor (totalPageCount) {
        if (!totalPageCount) return
        this.state = {
            pageNumber: 1,
            totalPageCount
        }
    }

    init (paramsObj) {
        let state = this.state
        // 页面元素的外部容器
        state.container = paramsObj.container || 'body'
        // 不包括开头和结尾的两个固定按钮外，中间最多展示几个数字页码按钮
        state.maxShowBtnCount = paramsObj.maxShowBtnCount || 5
        // 所有的页码元素，包括上一页、下一页
        state.pCName = paramsObj.pCName || 'page-li',
            // 当选中页码时添加的类名class
            state.activeCName = paramsObj.activeCName || 'page-active',
            // 代表页码数字的属性
            state.dataNumberAttr = paramsObj.dataNumberAttr || 'data-number',
            // 上一页 按钮的类名class
            state.prevCName = paramsObj.prevCName || 'page-prev',
            // 下一页 按钮的类名class
            state.nextCName = paramsObj.nextCName || 'page-next',
            // 禁用 上一页 按钮时给此按钮添加的类名class
            state.disbalePrevCName = paramsObj.disbalePrevCName || 'no-prev',
            // 禁用 下一页 按钮时给此按钮添加的类名class
            state.disbaleNextCName = paramsObj.disbaleNextCName || 'no-next',
            // 不包括 上一页 下一页 省略号 按钮的页码元素类名
            state.pageNumberCName = paramsObj.pageNumberCName || 'page-number'
        // 触发切换页面的事件
        state.swEvent = paramsObj.swEvent || 'click'
        // 切换页面时调用的函数
        state.onPageChange = paramsObj.onPageChange
        // 当需要省略符号占位时，确定 active的位置
        state.totalPageCount > state.maxShowBtnCount + 2 && (state.activePosition = Math.ceil(state.maxShowBtnCount / 2))
        this.renderPageDOM()
    }

    switchPage () {
        let state = this.state
        let pCNameList = this.selectorEle('.' + state.pCName, true)
        let pageNumber
        pCNameList.forEach(item => {
            item.addEventListener(state.swEvent, e => {
                const currentPageEle = e.target
                if (this.hasClass(currentPageEle, state.activeCName)) return
                let dataNumberAttr = currentPageEle.getAttribute(state.dataNumberAttr)
                if (dataNumberAttr) {
                    // 点击 数字 按钮
                    pageNumber = +dataNumberAttr
                } else if (this.hasClass(currentPageEle, state.prevCName)) {
                    // 点击 上一页 按钮
                    state.pageNumber > 1 && (pageNumber = state.pageNumber - 1)
                } else if (this.hasClass(currentPageEle, state.nextCName)) {
                    // 点击 下一页 按钮
                    state.pageNumber < state.totalPageCount && (pageNumber = state.pageNumber + 1)
                }
                pageNumber && this.gotoPage(pageNumber)
            })
        })
    }
    gotoPage (pageNumber) {
        let state = this.state
        let evaNumberLi = this.selectorEle('.' + state.pageNumberCName, true)
        let len = evaNumberLi.length
        if (!len || this.isIllegal(pageNumber)) return
        // 清除 active 样式
        this.removeClass(this.selectorEle(`.${state.pCName}.${state.activeCName}`), state.activeCName)
        if (state.activePosition) {
            let rEllipseSign = state.totalPageCount - (state.maxShowBtnCount - state.activePosition) - 1
            // 左边不需要出现省略符号占位
            if (pageNumber <= state.maxShowBtnCount && (pageNumber < rEllipseSign)) {
                if (+evaNumberLi[1].getAttribute(state.dataNumberAttr) > 2) {
                    for (let i = 1; i < state.maxShowBtnCount + 1; i++) {
                        evaNumberLi[i].innerText = i + 1
                        evaNumberLi[i].setAttribute(state.dataNumberAttr, i + 1)
                    }
                }
                this.hiddenEllipse('.ellipsis-head')
                this.hiddenEllipse('.ellipsis-tail', false)
                this.addClass(evaNumberLi[pageNumber - 1], state.activeCName)
            }
            // 两边都需要出现省略符号占位
            if (pageNumber > state.maxShowBtnCount && pageNumber < rEllipseSign) {
                // 针对 maxShowBtnCount===1 的特殊处理
                this.hiddenEllipse('.ellipsis-head', pageNumber === 2 && state.maxShowBtnCount === 1)
                this.hiddenEllipse('.ellipsis-tail', false)
                for (let i = 1; i < state.maxShowBtnCount + 1; i++) {
                    evaNumberLi[i].innerText = pageNumber + (i - state.activePosition)
                    evaNumberLi[i].setAttribute(state.dataNumberAttr, pageNumber + (i - state.activePosition))
                }
                this.addClass(evaNumberLi[state.activePosition], state.activeCName)
            }
            // 右边不需要出现省略符号占位
            if (pageNumber >= rEllipseSign) {
                this.hiddenEllipse('.ellipsis-tail')
                this.hiddenEllipse('.ellipsis-head', false)
                if (+evaNumberLi[len - 2].getAttribute(state.dataNumberAttr) < state.totalPageCount - 1) {
                    for (let i = 1; i < state.maxShowBtnCount + 1; i++) {
                        evaNumberLi[i].innerText = state.totalPageCount - (state.maxShowBtnCount - i) - 1
                        evaNumberLi[i].setAttribute(state.dataNumberAttr, state.totalPageCount - (state.maxShowBtnCount - i) - 1)
                    }
                }
                this.addClass(evaNumberLi[(state.maxShowBtnCount + 1) - (state.totalPageCount - pageNumber)], state.activeCName)
            }
        } else {
            // 不需要省略符号占位
            this.addClass(evaNumberLi[pageNumber - 1], state.activeCName)
        }
        state.pageNumber = pageNumber
        state.onPageChange && state.onPageChange(state)
        // 判断 上一页 下一页 是否可使用
        this.switchPrevNextAble()
    }

    switchPrevNextAble () {
        let state = this.state
        let prevBtn = this.selectorEle('.' + state.prevCName)
        let nextBtn = this.selectorEle('.' + state.nextCName)
        // 当前页已经是第一页，则禁止 上一页 按钮的可用性
        state.pageNumber > 1
            ? (this.hasClass(prevBtn, state.disbalePrevCName) && this.removeClass(prevBtn, state.disbalePrevCName))
            : (!this.hasClass(prevBtn, state.disbalePrevCName) && this.addClass(prevBtn, state.disbalePrevCName))
        // 当前页已经是最后一页，则禁止 下一页 按钮的可用性
        state.pageNumber >= state.totalPageCount
            ? (!this.hasClass(nextBtn, state.disbaleNextCName) && this.addClass(nextBtn, state.disbaleNextCName))
            : (this.hasClass(nextBtn, state.disbaleNextCName) && this.removeClass(nextBtn, state.disbaleNextCName))
    }

    renderPageDOM () {
        // 渲染页码DOM
        let state = this.state
        let pageContainer = this.selectorEle(state.container)
        if (!pageContainer) return
        let { totalPageCount, pCName, prevCName, disbalePrevCName, pageNumberCName,
            activeCName, dataNumberAttr, maxShowBtnCount,nextCName, disbaleNextCName } = state
        let paginationStr = `
    <ul class="pagination">
    <li class="${pCName} ${prevCName} ${disbalePrevCName}">上一页</li>
    <li class="${pCName} ${pageNumberCName} ${activeCName}" ${dataNumberAttr}='1'>1</li>
    `
        if (totalPageCount - 2 > maxShowBtnCount) {
            paginationStr += `
      <li class="${pCName} number-ellipsis ellipsis-head" style="display: none;">...</li>`
            for (let i = 2; i < maxShowBtnCount + 2; i++) {
                paginationStr += `<li class="${pCName} ${pageNumberCName} ${i === 1 ? activeCName : ''}" ${dataNumberAttr}='${i}'>${i}</li>`
            }
            paginationStr += `
      <li class="${pCName} number-ellipsis ellipsis-tail">...</li>
      <li class="${pCName} ${pageNumberCName}" ${dataNumberAttr}='${totalPageCount}'>${totalPageCount}</li>
      `
        } else {
            for (let i = 2; i <= totalPageCount; i++) {
                paginationStr += `<li class="${pCName} ${pageNumberCName}" ${dataNumberAttr}='${i}'>${i}</li>`
            }
        }
        paginationStr += `<li class="${pCName} ${nextCName}${totalPageCount === 1 ? ' ' + disbaleNextCName : ''}">下一页</li></ul>`
        pageContainer.innerHTML = paginationStr
        // 切换页码
        this.switchPage()
    }

    isIllegal (pageNumber) {
        let state = this.state
        return (
            state.pageNumber === pageNumber || Math.ceil(pageNumber) !== pageNumber ||
            pageNumber > state.totalPageCount || pageNumber < 1 ||
            typeof pageNumber !== 'number' || pageNumber !== pageNumber
        )
    }

    hiddenEllipse (selector, shouldHidden = true) {
        this.selectorEle(selector).style.display = shouldHidden ? 'none' : ''
    }

    selectorEle (selector, all = false) {
        return all ? document.querySelectorAll(selector) : document.querySelector(selector)
    }

    hasClass (eleObj, className) {
        return eleObj.classList.contains(className);
    }

    addClass (eleObj, className) {
        eleObj.classList.add(className);
    }

    removeClass (eleObj, className) {
        if (this.hasClass(eleObj, className)) {
            eleObj.classList.remove(className);
        }
    }
}