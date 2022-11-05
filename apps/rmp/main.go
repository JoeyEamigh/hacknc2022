package main

import (
	"github.com/JoeyEamigh/hacknc2022/server"
)

func main() {
	app := server.CreateServer()

	app.Listen(":3000")
}
