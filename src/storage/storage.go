package storage

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"time"
)

const dirPath string = ".ponza"

// 存储某个网站的全部评论
type Server struct {
	Host     string    `json:"host"`
	Key      string    `json:"key"`
	Articles []Article `json:"articles"`
}

// 存储某个网页的全部评论
type Article struct {
	Page     string    `json:"page"`
	Comments []Comment `json:"comment"`
}

// 存储具体的评论
type Comment struct {
	Comm  string `json:"comm"`
	Time  string `json:"time"`
	Name  string `json:"name"`
	Mail  string `json:"mail"`
	Agent string `json:"agent"`
}

// 存储数据，对数据进行处理

var HostList []Server

// 载入数据
func LoadData(dataMap *[]Server) {
	// 如果文件夹不存在的话就创建文件夹
	_, err := os.Stat(dirPath)
	if os.IsNotExist(err) {
		err := os.Mkdir(dirPath, os.ModePerm)
		if err != nil {
			fmt.Printf("mkdir data dir failed! [%v]\n", err)
		} else {
			fmt.Printf("mkdir data dir success!\n")
		}
	}
	// 遍历 .ponza 里面的文件
	files, _ := ioutil.ReadDir(dirPath)
	for _, f := range files {
		jsonStr := readFileToString(dirPath + "/" + f.Name())
		var server Server
		json.Unmarshal([]byte(jsonStr), &server)
		HostList = append(HostList, server)
	}
}

// 获取所有的网站的数据
func GetHostList() *[]Server {
	if len(HostList) == 0 {
		LoadData(&HostList)
	}
	return &HostList
}

// 获取单个网站数据
func GetHost(host string, key string) (*Server, int64) {
	if len(HostList) == 0 {
		LoadData(&HostList)
	}
	for _, server := range HostList {
		if server.Host == host {
			if server.Key == key {
				return &server, 0
			}
			return &Server{}, -2

		}
	}
	return &Server{}, -1
}

// 刷新数据到本地
func FlushData() {
	for _, server := range HostList {
		str, _ := json.MarshalIndent(server, "", "\t")
		fileName := ".ponza/" + server.Host + ".json"
		writeStringToFile(string(str), fileName)
	}
}

// 获取评论，-1 为 host 不正确， -2 为 key 不正确，-3 为 page 不正确
func GetArticle(host string, page string, key string) (*Article, int64) {
	hostMap := GetHostList()
	for _, server := range *hostMap {
		if server.Host == host {
			if server.Key == key {
				for _, article := range server.Articles {
					if article.Page == page {
						return &article, 0
					}
				}
				// 找不到对应的 page
				return &Article{}, -3
			} else {
				// key 不正确
				return &Article{}, -2
			}

		}
	}
	// host 不存在
	return &Article{}, -1
}

// 保存文章的评论
func InsertComment(article *Article, comm string, name string, mail string, agent string) {
	comment := Comment{
		Comm:  comm,
		Name:  name,
		Agent: agent,
		Time:  string(time.Now().Format("2006-01-02T15:04:05Z07:00")),
		Mail:  mail,
	}
	comments := append(article.Comments, comment)
	article.Comments = comments
	// 刷新存储本地
	FlushData()
}

func writeStringToFile(outputString string, fileName string) {
	outputFile, outputError := os.OpenFile(fileName, os.O_WRONLY|os.O_TRUNC|os.O_CREATE, 0666)
	if outputError != nil {
		fmt.Printf("An error occurred with file opening or creation\n")
		return
	}
	defer outputFile.Close()
	outputWriter := bufio.NewWriter(outputFile)
	outputWriter.WriteString(outputString)
	outputWriter.Flush()
}

func readFileToString(fileName string) string {
	inputFile, inputError := os.Open(fileName)
	if inputError != nil {
		fmt.Printf("")
		return "error"
	}
	defer inputFile.Close()
	inputReader := bufio.NewReader(inputFile)
	var res string
	for {
		inputString, readerError := inputReader.ReadString('\n')
		res += inputString
		if readerError == io.EOF {
			return res
		}
	}
	return res
}
