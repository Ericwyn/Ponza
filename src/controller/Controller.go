package controller

import (
	"github.com/gin-gonic/gin"
	"storage"
	"strconv"
	"strings"
	"utils"
)

// 获取某个页面的全部评论，按照时间顺序排列
func GetComm(context *gin.Context) {
	host := hostParse(context.GetHeader("host"))
	if strings.TrimSpace(host) == "" {
		host = hostParse(context.GetHeader("origin"))
	}
	page := context.PostForm("page")
	key := context.PostForm("key")

	article, i := storage.GetArticle(host, page, key)
	if i != 0 {
		switch i {
		case -1:
			context.JSON(200, map[string]string{
				"code": "4001",
			})
			break
		case -2:
			context.JSON(200, map[string]string{
				"code": "4002",
			})
			break
		case -3:
			context.JSON(200, map[string]string{
				"code": "4003",
			})
			break
		default:
			context.JSON(200, map[string]string{
				"code": "4000",
			})
		}
	} else {
		context.JSON(200, article)
	}
}

func UploadComm(context *gin.Context) {
	host := hostParse(context.GetHeader("host"))
	page := context.PostForm("page")
	key := context.PostForm("key")
	if strings.TrimSpace(host) == "" {
		host = hostParse(context.GetHeader("origin"))
	}

	comm := context.PostForm("comm")
	comm = utils.ReplaceCommXss(comm)
	name := context.PostForm("name")
	name = utils.ReplaceCommXss(name)
	site := context.PostForm("site")
	site = utils.ReplaceSiteXSS(site)

	if len(site) > 40 {
		site = site[0:40]
	}
	if len(name) > 20 {
		name = name[0:20]
	}
	agent := utils.GetUserAgent(context.GetHeader("user-agent"))

	i := storage.InsertComment(host, page, key, comm, name, site, agent)
	// -1 为 host 不正确， -2 为 key 不正确，-3 为 page 不正确
	if i != 0 {
		switch i {
		case -1:
			context.JSON(200, map[string]string{
				"code": "4001",
			})
			break
		case -2:
			context.JSON(200, map[string]string{
				"code": "4002",
			})
			break
		case -3:
			context.JSON(200, map[string]string{
				"code": "4003",
			})
			break
		default:
			context.JSON(200, map[string]string{
				"code": "4000",
			})
		}
	} else {
		storage.FlushData()
		context.JSON(200, map[string]string{
			"data": "upload message success",
		})
	}
}

// 初始化一个页面，当 GetComm 、UploadComm 接口返回 4003 时候调用
func InitComm(context *gin.Context) {
	host := hostParse(context.GetHeader("host"))
	page := context.PostForm("page")
	key := context.PostForm("key")
	if strings.TrimSpace(host) == "" {
		host = hostParse(context.GetHeader("origin"))
	}

	server, _, i := storage.GetServer(host, key)
	// -1 为 host 不正确， -2 为 key 不正确，-3 为 page 不正确
	if i >= 0 {
		for _, article := range server.Articles {
			if article.Page == page {
				context.JSON(200, map[string]string{
					"data": "page had create",
				})
				return
			}
		}
		article := storage.Article{
			Page:     page,
			Comments: []storage.Comment{},
			Count:    0,
			Like:     0,
		}
		server.Articles = append(server.Articles, article)
		context.JSON(200, map[string]string{
			"data": "page create success",
		})
		storage.HostList[i] = *server
		storage.FlushData()
	} else {
		switch i {
		case -1:
			context.JSON(200, map[string]string{
				"code": "4001",
			})
			break
		case -2:
			context.JSON(200, map[string]string{
				"code": "4002",
			})
			break
		default:
			context.JSON(200, map[string]string{
				"code": "4000",
			})
		}

	}
}

// 点赞接口
func likeArticle(context *gin.Context) {

}

func LikeComm(context *gin.Context) {
	host := hostParse(context.GetHeader("host"))
	page := context.PostForm("page")
	key := context.PostForm("key")
	comm := context.PostForm("comm")
	id, err := strconv.Atoi(comm)
	if err != nil {
		context.JSON(200, map[string]string{
			"code": "4000",
			"data": err.Error(),
		})
	}
	if strings.TrimSpace(host) == "" {
		host = hostParse(context.GetHeader("origin"))
	}
	for i, server := range storage.HostList {
		if server.Host == host && server.Key == key {
			for j, article := range server.Articles {
				if article.Page == page {
					for k, comment := range article.Comments {
						if comment.Id == id {
							storage.HostList[i].Articles[j].Comments[k].Like++
							storage.FlushData()
							context.JSON(200, map[string]string{
								"data": "like successful",
							})
						}
					}
				}
			}
		}
	}
	context.JSON(200, map[string]string{
		"data": "like failed",
	})
}

func hostParse(host string) string {
	host = strings.Replace(host, "https://", "", -1)
	host = strings.Replace(host, "http://", "", -1)
	host = strings.Replace(host, "/", "", -1)
	return host
}
