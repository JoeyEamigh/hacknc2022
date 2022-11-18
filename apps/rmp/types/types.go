package types

import "github.com/JoeyEamigh/hacknc2022/go-schema"

type Query struct {
	Text         string      `json:"text"`
	SchoolID     string      `json:"schoolID"`
	Fallback     bool        `json:"fallback"`
	DepartmentID interface{} `json:"departmentID"`
}

type SearchResponse struct {
	School schema.School `json:"school"`
	Search struct {
		Teachers struct {
			DidFallback bool `json:"didFallback"`
			Edges       []struct {
				Cursor string         `json:"cursor"`
				Node   schema.Teacher `json:"node"`
			} `json:"edges"`
			Filters []struct {
				Field   string `json:"field"`
				Options []struct {
					ID    string `json:"id"`
					Value string `json:"value"`
				} `json:"options"`
			} `json:"filters"`
			PageInfo struct {
				EndCursor   string `json:"endCursor"`
				HasNextPage bool   `json:"hasNextPage"`
			} `json:"pageInfo"`
			ResultCount int `json:"resultCount"`
		} `json:"teachers"`
	} `json:"search"`
}
