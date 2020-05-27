package main

import (
	"controller"
	"flag"
	"fmt"
	"github.com/satori/go.uuid"
	"net/http"
	"storage"
	"strings"
	"time"
)

var host = flag.String("k", "null", "add the key for host")
var versionFlag = flag.Bool("v", false, "show version info")

const version = "v1.0"

func main() {

	flag.Parse()

	if *versionFlag {
		fmt.Println("Ponza_" + version)
		return
	}

	// 先载入数据
	storage.LoadData(&storage.HostList)

	if *host == "null" {
		startPonzaServer()
	} else {
		key := initHost(*host)
		fmt.Println("key:", key, "for host:", *host)
	}
}
func startPonzaServer() {

	s := &http.Server{
		Addr:           ":2334",
		Handler:        controller.NewMux(),
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	s.ListenAndServe()

}

// 初始化一个网站的存储 json，返回该网站的 host
func initHost(host string) string {
	host = strings.Replace(host, "https", "", -1)
	host = strings.Replace(host, "http", "", -1)
	host = strings.Replace(host, "/", "", -1)

	list := storage.GetHostList()
	for _, server := range *list {
		if server.Host == host {
			return server.Key
		}
	}
	uuidTemp, _ := uuid.NewV4()
	key := strings.Replace(uuidTemp.String(), "-", "", -1)
	server := storage.Server{
		Host:     host,
		Key:      key,
		Articles: []storage.Article{},
	}
	*list = append(*list, server)
	storage.FlushData()
	return key
}

// TODO 分页功能
// TODO 回复功能
// TODO 评论点赞功能，对应的每个评论的 id 功能
// TODO 使用类似支增主键的形式来标记，但是有可能在并发条件下出现两个 id 一样的评论，该问题未解决

// TODO 页面点赞
// TODO 过长折叠
