package types

import "time"

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

func (School) TableName() string {
	return "School"
}

type Teacher struct {
	ID                    string    `json:"id" gorm:"primaryKey;column:id"`
	FirstName             string    `json:"firstName" gorm:"column:firstName"`
	LastName              string    `json:"lastName" gorm:"column:lastName"`
	Department            string    `json:"department" gorm:"column:department"`
	NumRatings            int       `json:"numRatings" gorm:"column:numRatings"`
	AvgRating             float64   `json:"avgRating" gorm:"column:avgRating"`
	AvgDifficulty         float64   `json:"avgDifficulty" gorm:"column:avgDifficulty"`
	WouldTakeAgainPercent float64   `json:"wouldTakeAgainPercent" gorm:"column:wouldTakeAgainPercent"`
	UpdatedAt             time.Time `gorm:"column:updatedAt"`

	School   School `json:"school" gorm:"foreignKey:SchoolID"`
	SchoolID string `gorm:"column:schoolId"`
}

func (Teacher) TableName() string {
	return "Teacher"
}
