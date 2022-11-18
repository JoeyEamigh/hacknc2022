package main

import (
	"github.com/JoeyEamigh/hacknc2022/rmp/server"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	err := server.ConnectToDatabase()

	if err != nil {
		panic(err)
	}

	app := server.CreateServer()

	app.Listen(":3000")
}
