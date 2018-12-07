# Ponza
静态博客评论框架，灵感来自 Gitment

## 使用

### 增加 key

    .ponza -k "blog.meetwhy.com"
    // 显示如下
    key: b9df8d72b06f4f8399c71ab520600130 for host: blog.meetwhy.com
    
为项目新建一个 key，该 key 只允许使用在来自域名 `blog.meetwhy.com` 的访问


### 启动

    .ponza

启动项目在 localhost:2334 端口

### 配置反向代理
将你的 ponza 服务域名反向代理到 localhost:2334，如果你的 caddy 配置示例如下
    
    api.ponza.host.com {
        proxy / localhost:2334 {    
            transparent
        }
    }
    
    
### 引入 Ponza 的 js 和 css

    <link rel="stylesheet" href="ponza.css">
    <script src="js/ponza.js"></script>

### 配置 
    
    Ponza("test",{                                       // 配置评论所在 dom
        page:window.location.pathname,                      // 配置页面标记
        server:"https://wx.meetwhy.com",                    // 配置服务器地址
        key:"b9df8d72b06f4f8399c71ab520600130",             // 配置 key
    });

## 后台数据库
Ponza 将全部数据都存储在本地的 json 文件当中，不需要依赖于数据库
存储的地址是 `.ponza` 文件夹，每个文件以 `host.json` 来命名，存储该网站下面所有的评论数据

## 接口
### 上传评论接口
 - `/api/uploadComm`
 - `POST`
 - 参数
    - `key` ponza 的 key
    - `page` 页面的标记 
    - `comm` 评论正文
    - `name` 评论的昵称
    - `mail` 邮箱
 - 返回
        
        "upload message success"

### 获取评论接口
 - `/api/getComm`
 - `POST`
 - 参数
    - `key` ponza 的 key
    - `page` 页面的标记
 - 返回
    
        {
            "page": "/blog/ubuntu-bash-ch.html",
            "comment": [
                {
                    "comm": "评论 : 1544173519984",
                    "time": "2018-12-07T17:05:20+08:00",
                    "name": "Ericwyn",
                    "mail": "ericwyn.chen@gmail.com",
                    "agent": "Ubuntu 18.04 上的 Chrome 71.0 浏览器"
                },
                {
                    "comm": "评论 : 1544173530023",
                    "time": "2018-12-07T17:05:30+08:00",
                    "name": "Ericwyn",
                    "mail": "ericwyn.chen@gmail.com",
                    "agent": "Ubuntu 18.04 上的 Chrome 71.0 浏览器"
                }
            ]
        }
 
### 评论初始化接口
当评论接口或者上传接口返回 4003 时候代表页面的评论数据未创建，使用该接口创建该页面的数据配置
 - `api/initComm`
 - `POST`
 - 参数
     - `key` ponza 的 key
     - `page` 页面的标记
    
 - 返回
    
        "page create success"
    
### 错误码

       {"code":"4003"}

 - 4000     服务器错误
 - 4001     host 错误
 - 4002     key 错误
 - 4003     page 错误