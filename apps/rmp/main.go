package main

import (
	"fmt"
	"time"

	"github.com/JoeyEamigh/hacknc2022/server"
	"github.com/JoeyEamigh/hacknc2022/types"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	err := server.ConnectToDatabase()

	if err != nil {
		panic(err)
	}

	unc := types.School{
		ID:   "U2Nob29sLTEyMzI=",
		Name: "The University of North Carolina at Chapel Hill",
	}

	err = server.CreateSchoolIfNotExists(&unc)

	if err != nil {
		panic(err)
	}

	joey := types.Teacher{
		FirstName:             "Joey",
		LastName:              "Eamigh",
		Department:            "Computer Science",
		NumRatings:            1,
		AvgRating:             5.0,
		AvgDifficulty:         5.0,
		WouldTakeAgainPercent: 100.0,
		School:                unc,
	}

	err = server.CreateTeacherOrUpdateIfOld(&joey, 24*time.Hour)

	if err != nil {
		panic(err)
	}

	teacher, err := server.GetTeacher("Joey", "Eamigh", "Computer Science")

	if err != nil {
		panic(err)
	}

	fmt.Println(teacher)

	// app := server.CreateServer()

	// app.Listen(":3000")
}
