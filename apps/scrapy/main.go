package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/JoeyEamigh/hacknc2022/go-schema"
	"github.com/JoeyEamigh/hacknc2022/scrapy/db"
	"github.com/JoeyEamigh/hacknc2022/scrapy/parse"
	"github.com/ericchiang/css"
	"github.com/joho/godotenv"
	"golang.org/x/net/html"
)

const (
	URL           = "https://reports.unc.edu/class-search/?"
	TableSelector = "table#results-table > tbody"
)

func main() {
	godotenv.Load()

	sel, err := css.Parse(TableSelector)
	if err != nil {
		panic(err)
	}

	params := url.Values{}
	params.Add("term", "2023 Spring")
	params.Add("subject", "AAAD")

	resp, err := http.Get(URL + params.Encode())
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()
	node, err := html.Parse(resp.Body)
	if err != nil {
		panic(err)
	}

	// it's okay if this panics out of bounds for now
	table := sel.Select(node)[0]
	classes, err := parse.GetClasses(table)
	if err != nil {
		panic(err)
	}

	err = db.ConnectToDatabase()
	if err != nil {
		panic(err)
	}

	err = db.UpsertSchool(&schema.School{RMPID: "U2Nob29sLTEyMzI=", Name: "UNC"})
	if err != nil {
		panic(err)
	}

	classesPP, err := json.Marshal(classes[0])
	if err != nil {
		panic(err)
	}

	fmt.Println(string(classesPP))
}
