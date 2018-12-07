package controller

import (
	"github.com/gin-gonic/gin"
	"storage"
	"strings"
	"utils"
)

// 获取某个页面的全部评论，按照时间顺序排列
func GetComm(context *gin.Context) {
	host := hostParse(context.GetHeader("host"))
	page := context.PostForm("page")
	key := context.PostForm("key")

	article, i := storage.GetArticle(host, page, key)
	if i != 0 {
		switch i {
		case -1:
			context.JSON(4001, "host error")
			break
		case -2:
			context.JSON(4002, "key error")
			break
		case -3:
			context.JSON(4003, "page error")
			break
		default:
			context.JSON(4000, "ponza error, please see the log")
		}
	} else {
		context.JSON(200, article)
	}
}

func UploadComm(context *gin.Context) {
	host := hostParse(context.GetHeader("host"))
	page := context.PostForm("page")
	key := context.PostForm("key")

	comm := context.PostForm("comm")
	name := context.PostForm("name")
	mail := context.PostForm("mail")
	agent := utils.GetUserAgent(context.GetHeader("user-agent"))

	article, i := storage.GetArticle(host, page, key)
	// -1 为 host 不正确， -2 为 key 不正确，-3 为 page 不正确
	if i != 0 {
		switch i {
		case -1:
			context.JSON(4001, "host error")
			break
		case -2:
			context.JSON(4002, "key error")
			break
		case -3:
			context.JSON(4003, "page error")
			break
		default:
			context.JSON(4000, "ponza error, please see the log")
		}
	} else {
		storage.InsertComment(article, comm, name, mail, agent)
	}
}

// 初始化一个页面，当 GetComm 、UploadComm 接口返回 4003 时候调用
func InitComm(context *gin.Context) {
	host := hostParse(context.GetHeader("host"))
	page := context.PostForm("page")
	key := context.PostForm("key")

	server, i := storage.GetHost(host, key)
	// -1 为 host 不正确， -2 为 key 不正确，-3 为 page 不正确
	if i == 0 {
		context.JSON(200, "page create success")
	} else {
		switch i {
		case -1:
			context.JSON(4001, "host error")
			break
		case -2:
			context.JSON(4002, "key error")
			break
		}
		article := storage.Article{
			Page:     page,
			Comments: []storage.Comment{},
		}
		articles := append(server.Articles, article)
		// 替换页面
		server.Articles = articles
		// 刷新数据
		storage.FlushData()
	}
}

func hostParse(host string) string {
	host = strings.Replace(host, "https", "", -1)
	host = strings.Replace(host, "http", "", -1)
	host = strings.Replace(host, "/", "", -1)
	return host
}
