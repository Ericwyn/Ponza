package controller

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"os"
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
	if len(originsList) == 0 {
		fmt.Println(" Haven't set a key for any website yet, please ues '-k \"host\"' to set a key ")
		os.Exit(0)
	}
	config.AllowOrigins = originsList
	config.AllowMethods = []string{"GET, OPTIONS, POST, PUT, DELETE"}
	config.AllowHeaders = []string{"Access-Control-Allow-Origin", "Origin"}
	route.Use(cors.New(config))

	initAPI(route)
	return route
}
