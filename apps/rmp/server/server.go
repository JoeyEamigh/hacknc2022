package server

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/url"
	"os"

	"github.com/JoeyEamigh/hacknc2022/types"
	"github.com/gofiber/fiber/v2"
	"github.com/machinebox/graphql"
)

const RMP_GQL_CLIENT = "https://www.ratemyprofessors.com/graphql"

var QUERY string
var CLIENT *graphql.Client

func init() {
	q, err := os.ReadFile("prof.graphql")

	if err != nil {
		panic(err)
	}

	QUERY = string(q)

	CLIENT = graphql.NewClient(RMP_GQL_CLIENT)
}

func ConvertSchoolID(schoolID string) string {
	schoolString := fmt.Sprintf("School-%s", schoolID)
	return base64.StdEncoding.EncodeToString([]byte(schoolString))
}

func CreateRequest(school string, prof string) *graphql.Request {
	req := graphql.NewRequest(QUERY)

	prof_query := types.Query{
		Text:         prof,
		SchoolID:     school,
		Fallback:     true,
		DepartmentID: nil,
	}

	req.Var("schoolID", school)
	req.Var("query", prof_query)
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Authorization", "Basic dGVzdDp0ZXN0") // Yes, their auth header is base64 test:test

	return req
}

func ReparseResponse(resp types.SearchResponse) []types.Teacher {
	var teachers []types.Teacher

	for _, edge := range resp.Search.Teachers.Edges {
		teachers = append(teachers, edge.Node)
	}

	return teachers
}

func HandleSchoolAndProf(c *fiber.Ctx) error {
	school, err := url.QueryUnescape(c.Params("school"))

	if err != nil {
		return c.Status(400).SendString("Invalid school")
	}

	school = ConvertSchoolID(school)
	prof, err := url.QueryUnescape(c.Params("prof"))

	if err != nil {
		return c.Status(400).SendString("Invalid prof")
	}

	fmt.Println(prof)

	req := CreateRequest(school, prof)
	var respData types.SearchResponse
	ctx := context.Background()

	if err := CLIENT.Run(ctx, req, &respData); err != nil {
		return c.Status(500).SendString("Error querying rmp")
	}

	// reparsed := ReparseResponse(respData)

	// return c.JSON(reparsed)
	return c.JSON(respData)
}

func HandleProf(c *fiber.Ctx) error {
	prof, err := url.QueryUnescape(c.Params("prof"))

	if err != nil {
		return c.Status(400).SendString("Invalid prof")
	}

	req := CreateRequest("", prof)
	var respData types.SearchResponse
	ctx := context.Background()

	if err := CLIENT.Run(ctx, req, &respData); err != nil {
		return c.Status(500).SendString("Error querying rmp")
	}

	reparsed := ReparseResponse(respData)

	return c.JSON(reparsed)
}

func CreateServer() *fiber.App {
	app := fiber.New()

	app.Get("/:school/:prof", HandleSchoolAndProf)

	app.Get("/:prof", HandleProf)

	return app
}
