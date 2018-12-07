function ajax_post(url, params, success_callback, fail_callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    let formData = new FormData();
    if (params !== null) {
        for (let i = 0; i < params.length; i++) {
            formData.append(params[i][0],params[i][1])
        }
        console.log("发送了 fd"+formData.length);
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

let page;
let server;
let key;

function Ponza(domId,option){
    page = option.page;
    server = option.server;
    key = option.key;
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
            let json = JSON.parse(resp);
            console.log(json);
        },
        function (status) {
            console.log("error : "+status)
        }
    )
}

// 初始化一篇文章的评论
function initComm(){
    ajax_post(
        server+"/api/initComm",
        [
            ["key", key],
            ["page",page],
        ],
        function (resp) {
            let json = JSON.parse(resp);
            console.log(json);
        },
        function (status) {
            console.log("error : "+status)
        }
    )
}

// 上传一篇文章的评论
function uploadComm(comm, name, mail){
    ajax_post(
        server+"/api/uploadComm",
        [
            ["key", key],
            ["page", page],
            ["comm", comm],
            ["name", name],
            ["mail", mail],
        ],
        function (resp) {
            let json = JSON.parse(resp);
            console.log(json);
        },
        function (status) {
            console.log("error : "+status)
        }
    )
}