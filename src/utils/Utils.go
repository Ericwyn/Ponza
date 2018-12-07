package utils

import (
	"github.com/mssola/user_agent"
)

// 对 userAgent 的解析，解析出 浏览器-系统-版本号
func GetUserAgent(userAgentFromHeader string) string {
	ua := user_agent.New(userAgentFromHeader)
	name, version := ua.Browser()
	return ua.OS() + " " + ua.Platform() + " 的 " + name + " 浏览器 " + version
}
