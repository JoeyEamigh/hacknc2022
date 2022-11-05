package types

type Query struct {
	Text         string      `json:"text"`
	SchoolID     string      `json:"schoolID"`
	Fallback     bool        `json:"fallback"`
	DepartmentID interface{} `json:"departmentID"`
}

type SearchResponse struct {
	School School `json:"school"`
	Search struct {
		Teachers struct {
			DidFallback bool `json:"didFallback"`
			Edges       []struct {
				Cursor string  `json:"cursor"`
				Node   Teacher `json:"node"`
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

type School struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Teacher struct {
	FirstName             string  `json:"firstName"`
	LastName              string  `json:"lastName"`
	Department            string  `json:"department"`
	NumRatings            int     `json:"numRatings"`
	AvgRating             float64 `json:"avgRating"`
	AvgDifficulty         float64 `json:"avgDifficulty"`
	WouldTakeAgainPercent float64 `json:"wouldTakeAgainPercent"`
	School                School  `json:"school"`
}
