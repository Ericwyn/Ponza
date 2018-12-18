package utils

import (
	"github.com/mssola/user_agent"
	"strings"
)

// 对 userAgent 的解析，解析出 浏览器-系统-版本号
func GetUserAgent(userAgentFromHeader string) string {
	ua := user_agent.New(userAgentFromHeader)
	name, version := ua.Browser()
	return ua.OS() + " " + ua.Platform() + " 的 " + name + " 浏览器 " + version
}

func ReplaceCommXss(input string) string {
	input = strings.Replace(input, "&nbsp;", "{{{SPACE}}}", -1)
	input = strings.Replace(input, "&", "&amp;", -1)
	input = strings.Replace(input, "<", "&lt;", -1)
	input = strings.Replace(input, ">", "&gt;", -1)
	input = strings.Replace(input, "\"", "&quot;", -1)
	input = strings.Replace(input, "'", "&#x27;", -1)
	input = strings.Replace(input, "/", "&#x2F;", -1)
	input = strings.Replace(input, "{{{SPACE}}}", "&nbsp;", -1)
	return input
}

func ReplaceSiteXSS(site string) string {
	if len(site) > 11 && strings.ToLower(site)[0:11] == "javascript:" {
		site = site[12:]
	}
	site = strings.Replace(site, "&", "&amp;", -1)
	site = strings.Replace(site, "<", "&lt;", -1)
	site = strings.Replace(site, ">", "&gt;", -1)
	site = strings.Replace(site, "\"", "&quot;", -1)
	site = strings.Replace(site, "'", "&#x27;", -1)
	return site
}
