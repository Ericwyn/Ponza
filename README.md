# Ponza
静态博客评论框架，灵感来自 Gitment

## 使用

### 增加 key

    .ponza -k "blog.meetwhy.com"
    // 得到
    key:hufe-fhufa32-129fhv-chaldf for host:blog.meetwhy.com
    
为项目新建一个 key，该 key 只允许使用在来自域名 `blog.meetwhy.com` 的访问


### 启动

    .ponza

启动项目在 localhost:2334 端口

### 配置反向代理
将你的 ponza 服务域名反向代理到 localhost:2334，如果你的 caddy 配置示例如下


    // TODO
    
### 引入 Ponza 的 js

    <script src="js/ponza.js"></script>

### 配置 
    
    const ponza = new Ponza({
      page: 'page-name',                        // 设置页面的标记，以便上传和读取评论
      oauth: {
        https: true                             //是否使用 https 访问
        server: api.ponza.meetwhy.com           // ponza 服务的地址
        token: 'hufe-fhufa32-129fhv-chaldf',    // 使用 .ponza -k "host" 获取的 key
      }
    })
    
    ponza.run('comments')                       // 配置你的评论列表所在的 dom 

## 后台数据库
Ponza 将全部数据都存储在本地的 json 文件当中，不需要依赖于数据库

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

### 获取评论接口
 - `/api/getComm`
 - `POST`
 - 参数
    - `key` ponza 的 key
    - `page` 页面的标记

### 评论初始化接口
 - `api/initComm`
 - `POST`
 - 参数
     - `key` ponza 的 key
     - `page` 页面的标记

### 错误码
 - 4000     服务器错误
 - 4001     host 错误
 - 4002     key 错误
 - 4003     page 错误