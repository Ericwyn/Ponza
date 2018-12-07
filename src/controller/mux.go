package controller

import "github.com/gin-gonic/gin"

// 设置 API 路由
func initAPI(router *gin.Engine) {
	router.POST("/getComm", GetComm)
	router.POST("/uploadComm", UploadComm)
	router.POST("/initComm", InitComm)

}

// 返回全局路由, 包括静态资源
func NewMux() *gin.Engine {
	route := gin.Default()
	initAPI(route)
	return route
}
