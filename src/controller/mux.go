package controller

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"storage"
)

// 设置 API 路由
func initAPI(router *gin.Engine) {
	router.POST("api/getComm", GetComm)
	router.POST("api/uploadComm", UploadComm)
	router.POST("api/initComm", InitComm)

}

// 返回全局路由, 包括静态资源
func NewMux() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	route := gin.Default()

	list := storage.GetHostList()
	var originsList []string
	for _, server := range *list {
		originsList = append(originsList, "https://"+server.Host)
		originsList = append(originsList, "http://"+server.Host)
	}

	// 允许跨域
	config := cors.DefaultConfig()
	config.AllowOrigins = originsList
	config.AllowMethods = []string{"*"}
	config.AllowHeaders = []string{"*"}
	route.Use(cors.New(config))

	initAPI(route)
	return route
}
