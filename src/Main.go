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

func main() {
	// 先载入数据
	storage.LoadData(&storage.HostList)

	flag.Parse()
	if *host == "null" {
		startPonzaServer()
	} else {
		key := initHost(*host)
		fmt.Println("key:", key, "for host:", *host)
	}
}
func startPonzaServer() {
	// 先载入本地的 json 数据
	s := &http.Server{
		Addr:           ":8080",
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
