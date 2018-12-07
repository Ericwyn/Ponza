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
Ponza 依赖于 Mysql，数据库名称为 ponza，包含下面的表
### comment 表
 - comment 评论内容
 - time 评论时间
 - nickname 昵称
 - mail 邮箱
 - userAgent 用户评论时候浏览器的 UserAgent
 - page 网站的 page
 - host 网站 host
 
### host 表
 - host 网站的 host
 - key 该网站请求时候需要的 key 